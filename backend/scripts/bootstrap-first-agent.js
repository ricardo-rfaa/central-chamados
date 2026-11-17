// Local, one-time bootstrap for the first staging agent.
// Run from backend/ with backend/.env.staging. This is intentionally not an API route.
const path = require("node:path");
const stagingEnv = require("dotenv").config({
  path: path.resolve(__dirname, "../.env.staging"),
});
if (stagingEnv.parsed) {
  process.env.DATABASE_URL = stagingEnv.parsed.DATABASE_URL || "";
  process.env.DIRECT_URL = stagingEnv.parsed.DIRECT_URL || "";
}

const bcrypt = require("bcrypt");
const readline = require("node:readline");
const prisma = require("../src/lib/prisma");

const STAGING_PROJECT_REF = "naydklmjkmwmiudvqise";

class SafeSetupError extends Error {}

let currentStep = "preparação";

function verifyStagingTarget() {
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    throw new SafeSetupError("Este procedimento só pode ser executado localmente.");
  }
  if (process.env.BOOTSTRAP_STAGING_PROJECT_REF !== STAGING_PROJECT_REF) {
    throw new SafeSetupError(
      "Defina BOOTSTRAP_STAGING_PROJECT_REF com o identificador do projeto de staging antes de continuar."
    );
  }
  if (!stagingEnv.parsed || !process.env.DATABASE_URL || !process.env.DIRECT_URL) {
    throw new SafeSetupError(
      "Configure DATABASE_URL e DIRECT_URL em backend/.env.staging."
    );
  }

  for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
    let databaseUrl;
    try {
      databaseUrl = new URL(process.env[key]);
    } catch {
      throw new SafeSetupError(`${key} em backend/.env.staging não contém uma URL válida.`);
    }

    let username = "";
    try {
      username = decodeURIComponent(databaseUrl.username);
    } catch {
      // Fail closed below without displaying the URL.
    }

    const pointsToStaging =
      databaseUrl.hostname === `db.${STAGING_PROJECT_REF}.supabase.co` ||
      username.endsWith(`.${STAGING_PROJECT_REF}`);

    if (!pointsToStaging) {
      throw new SafeSetupError(
        `${key} não identifica o projeto de staging esperado. Nenhum dado foi alterado.`
      );
    }
  }
}

function askLine(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function askHidden(prompt) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    return Promise.reject(
      new SafeSetupError("Execute o comando em um terminal interativo para digitar a senha com segurança.")
    );
  }

  readline.emitKeypressEvents(process.stdin);
  return new Promise((resolve, reject) => {
    let value = "";
    const wasRaw = process.stdin.isRaw;

    const restore = () => {
      process.stdin.removeListener("keypress", onKeypress);
      process.stdin.setRawMode(Boolean(wasRaw));
      process.stdin.pause();
      process.stdout.write("\n");
    };

    const onKeypress = (character, key = {}) => {
      if (key.ctrl && key.name === "c") {
        restore();
        reject(new SafeSetupError("Operação cancelada."));
        return;
      }
      if (key.name === "return" || key.name === "enter") {
        restore();
        resolve(value);
        return;
      }
      if (key.name === "backspace") {
        value = [...value].slice(0, -1).join("");
        return;
      }
      if (character && !key.ctrl && !key.meta && character >= " ") {
        value += character;
      }
    };

    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("keypress", onKeypress);
  });
}

async function main() {
  verifyStagingTarget();

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new SafeSetupError("Execute o comando em um terminal interativo.");
  }

  console.log("Cadastro local da primeira conta de atendente no staging.");
  console.log("Nenhuma senha ou URL de conexão será exibida.");
  console.log("Este procedimento não executa seeds nem migrations.\n");

  const name = await askLine("Nome: ");
  const email = (await askLine("E-mail: ")).toLowerCase();
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new SafeSetupError("Informe um nome e um e-mail válidos.");
  }

  const password = await askHidden("Senha (mínimo de 12 caracteres): ");
  const passwordAgain = await askHidden("Digite a senha novamente: ");
  if (password.length < 12) {
    throw new SafeSetupError("A senha precisa ter pelo menos 12 caracteres.");
  }
  if (password !== passwordAgain) {
    throw new SafeSetupError("As senhas não coincidem.");
  }

  const confirmation = await askLine(
    `Para confirmar a criação somente no staging, digite CRIAR ATENDENTE: `
  );
  if (confirmation !== "CRIAR ATENDENTE") {
    throw new SafeSetupError("Confirmação não recebida. Nenhum dado foi alterado.");
  }

  currentStep = "criação do hash da senha";
  const passwordHash = await bcrypt.hash(password, 12);
  currentStep = "conexão e gravação no staging";
  await prisma.$transaction(async (tx) => {
    const agents = await tx.user.count({ where: { role: "agent" } });
    if (agents > 0) {
      throw new SafeSetupError(
        "Já existe uma conta de atendente. Use o fluxo autenticado de cadastro para adicionar outras."
      );
    }

    const existingUser = await tx.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new SafeSetupError("Esse e-mail já pertence a uma conta. Nenhum dado foi alterado.");
    }

    await tx.user.create({
      data: { name, email, passwordHash, role: "agent" },
    });
  }, { isolationLevel: "Serializable" });

  console.log("\nPrimeira conta de atendente criada no staging.");
  console.log("Entre pela opção de acesso do atendente para validar o fluxo.");
}

main()
  .catch((error) => {
    if (error instanceof SafeSetupError) {
      console.error(error.message);
    } else {
      const safeName =
        typeof error?.name === "string" && /^[A-Za-z][A-Za-z0-9_]{0,60}$/.test(error.name)
          ? error.name
          : "Error";
      const safeCode =
        typeof error?.code === "string" && /^[A-Z][0-9]{4}$/.test(error.code)
          ? error.code
          : "sem código";
      console.error(
        `Falha na etapa "${currentStep}" (${safeName}, código ${safeCode}). Nenhum segredo foi exibido.`
      );
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
