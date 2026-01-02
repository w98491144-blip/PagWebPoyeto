import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

type LegalSection = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

type LegalTemplate = {
  title: string;
  intro: string[];
  sections: LegalSection[];
};

const buildTemplates = (siteName: string, companyName: string, email: string) => ({
  privacidad: {
    title: "Politica de Privacidad",
    intro: [],
    sections: [
      {
        title: "Identidad del responsable",
        paragraphs: [
          `${companyName} es el responsable del tratamiento de los datos personales del sitio ${siteName}.`,
          "El tratamiento se realiza conforme a la Ley N. 29733 - Ley de Proteccion de Datos Personales y su Reglamento."
        ]
      },
      {
        title: "Datos que recopilamos",
        paragraphs: [
          "Recopilamos informacion necesaria para brindar el servicio y mejorar la experiencia."
        ],
        list: [
          "Datos entregados por el usuario: nombre, correo e informacion asociada a pedidos o consultas.",
          "Datos de navegacion: direccion IP, navegador, dispositivo, paginas visitadas y fecha/hora de acceso.",
          "Interacciones basicas del sitio para entender el uso del catalogo."
        ]
      },
      {
        title: "Finalidad del tratamiento",
        paragraphs: [
          "Usamos la informacion para operar el sitio y brindar atencion adecuada."
        ],
        list: [
          "Gestionar pedidos, consultas y comunicaciones.",
          "Mejorar el contenido y la experiencia del sitio.",
          "Medir el rendimiento de campanas y enlaces externos.",
          "Enviar comunicaciones cuando el usuario lo haya autorizado."
        ]
      },
      {
        title: "Proveedores y transferencias",
        paragraphs: [
          "No vendemos ni comercializamos datos personales.",
          "Podemos usar proveedores tecnologicos (como Meta o Google) para analitica y medicion, bajo sus propias politicas de privacidad.",
          "Estos proveedores pueden procesar informacion en servidores ubicados fuera del Peru."
        ]
      },
      {
        title: "Conservacion y derechos ARCO",
        paragraphs: [
          "Los datos se conservan solo por el tiempo necesario para cumplir las finalidades descritas.",
          "El usuario puede ejercer sus derechos de Acceso, Rectificacion, Cancelacion y Oposicion enviando una solicitud a:",
          `${email}.`
        ]
      },
      {
        title: "Seguridad y cambios",
        paragraphs: [
          "Aplicamos medidas tecnicas y organizativas razonables para proteger la informacion.",
          "El sitio puede incluir enlaces a terceros, cuyos contenidos y politicas son independientes.",
          "Esta Politica puede actualizarse y los cambios se publicaran en esta misma pagina."
        ]
      }
    ]
  },
  terminos: {
    title: "Terminos y Condiciones",
    intro: [],
    sections: [
      {
        title: "Uso del sitio",
        paragraphs: [
          "El usuario se compromete a utilizar el sitio de forma responsable y conforme a la ley vigente."
        ]
      },
      {
        title: "Contenido y enlaces",
        paragraphs: [
          "El contenido del sitio es informativo y puede cambiar sin previo aviso.",
          "Los enlaces externos se rigen por sus propios terminos y politicas."
        ]
      },
      {
        title: "Actualizaciones",
        paragraphs: [
          "Podemos actualizar estos terminos en cualquier momento y la version vigente se publica en esta pagina."
        ]
      }
    ]
  }
});

const getTemplate = async (slug: string): Promise<LegalTemplate | null> => {
  const settings = await getSiteSettings();
  const siteName = settings.brand_name ?? "Sitio web";
  const companyName = settings.brand_name ?? siteName ?? "Empresa";
  const email = settings.contact_email ?? "correo@dominio.com";
  const templates = buildTemplates(siteName, companyName, email);
  return templates[slug as keyof typeof templates] ?? null;
};

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}) {
  const template = await getTemplate(params.slug);
  return {
    title: template ? template.title : "Legal"
  };
}

export default async function LegalPage({
  params
}: {
  params: { slug: string };
}) {
  const template = await getTemplate(params.slug);

  if (!template) {
    notFound();
  }

  return (
    <section className="space-y-10 pt-6 md:pt-10">
      <header className="mx-auto max-w-4xl space-y-3 text-left">
        <h1 className="font-serif text-4xl font-bold text-ink-900 md:text-6xl">
          {template.title}
        </h1>
        {template.intro.length > 0 && (
          <div className="space-y-4 text-base text-ink-700 md:text-lg">
            {template.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 md:gap-10">
        {template.sections.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border-2 border-ink-200 p-6 md:p-8"
          >
            <h2 className="text-2xl font-semibold text-ink-900 md:text-3xl">
              {section.title}
            </h2>
            <div className="mt-3 h-0.5 w-16 bg-ink-200" />
            <div className="mt-4 space-y-3 text-base text-ink-700 md:text-lg">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {section.list && (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-ink-700 md:text-lg">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
