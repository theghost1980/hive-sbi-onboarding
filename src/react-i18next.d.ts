import "react-i18next";

interface ResourceType {
  translation: {
    welcome_title: string;
    how_it_works_title: string;
    contact_title: string;
    made_by: string;
    Powered_by: string;
    General: string;
    "Encuentra más información y soporte sobre HSBI y esta herramienta en:": string;
    "Desarrolladores y Colaboradores": string;
    "Recursos Útiles para Desarrollo en Hive": string;
    "Usar esta herramienta es fácil. Sigue estos pasos:": string;
    "¡Comienza Ahora!": string;
    "¿Listo para apadrinar a tu primer usuario en Hive SBI?": string;
    "Ir a Onboard Usuario": string;
    pausado_por_cursor: string;

    // Ajusta esta sección según la estructura real de tu translation.json
    // homepage: {
    //   hero: { title: string; subtitle: string; },
    //   what_is_sbi: { title: string; p1: string; p2: string; },
    //   // ... etc.
    // }
  };
}

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: ResourceType;
  }
}
