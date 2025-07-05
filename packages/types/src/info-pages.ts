import { Timestamp } from 'firebase/firestore'

export interface InfoPage {
  slug: string
  type: string
  fixed: boolean
  visible: boolean
  status: 'published' | 'draft'
  title: {
    es: string
    en: string
  }
  seoTitle: {
    es: string
    en: string
  }
  seoDescription: {
    es: string
    en: string
  }
  content: {
    es: string
    en: string
  }
}

export const INFO_PAGES: InfoPage[] = [
  {
    slug: 'customer-service',
    type: 'customer-service',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Servicio al cliente',
      en: 'Customer Service'
    },
    seoTitle: {
      es: 'Servicio al cliente',
      en: 'Customer Service'
    },
    seoDescription: {
      es: 'Información para resolver dudas y ayudarte',
      en: 'Information to help you and answer your questions'
    },
    content: {
      es: '<p>Aquí puedes colocar tu política de atención al cliente.</p>',
      en: '<p>Here you can add your customer service policy.</p>'
    }
  },
  {
    slug: 'find-us',
    type: 'find-us',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Ubícanos',
      en: 'Find Us'
    },
    seoTitle: {
      es: 'Ubícanos - Encuentra nuestra tienda',
      en: 'Find Us - Store Location'
    },
    seoDescription: {
      es: 'Encuentra nuestra ubicación y horarios de atención',
      en: 'Find our location and business hours'
    },
    content: {
      es: '<p>Información sobre nuestra ubicación y horarios de atención.</p>',
      en: '<p>Information about our location and business hours.</p>'
    }
  },
  {
    slug: 'shipping-policy',
    type: 'shipping-policy',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Política de envíos',
      en: 'Shipping Policy'
    },
    seoTitle: {
      es: 'Política de envíos y entregas',
      en: 'Shipping and Delivery Policy'
    },
    seoDescription: {
      es: 'Información sobre nuestros métodos de envío y tiempos de entrega',
      en: 'Information about our shipping methods and delivery times'
    },
    content: {
      es: '<p>Detalles sobre nuestras políticas de envío y entrega.</p>',
      en: '<p>Details about our shipping and delivery policies.</p>'
    }
  },
  {
    slug: 'terms',
    type: 'terms',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Términos y condiciones',
      en: 'Terms and Conditions'
    },
    seoTitle: {
      es: 'Términos y condiciones de uso',
      en: 'Terms and Conditions of Use'
    },
    seoDescription: {
      es: 'Términos legales y condiciones de uso de nuestra tienda',
      en: 'Legal terms and conditions of use for our store'
    },
    content: {
      es: '<p>Términos y condiciones legales de uso de la tienda.</p>',
      en: '<p>Legal terms and conditions for using our store.</p>'
    }
  },
  {
    slug: 'claims-book',
    type: 'claims-book',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Libro de reclamaciones',
      en: 'Claims Book'
    },
    seoTitle: {
      es: 'Libro de reclamaciones virtual',
      en: 'Virtual Claims Book'
    },
    seoDescription: {
      es: 'Registra aquí tus reclamos o quejas',
      en: 'Register your claims or complaints here'
    },
    content: {
      es: '<p>Formulario y proceso para registrar reclamos.</p>',
      en: '<p>Form and process to register claims.</p>'
    }
  },
  {
    slug: 'privacy-policy',
    type: 'privacy-policy',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Aviso de privacidad',
      en: 'Privacy Policy'
    },
    seoTitle: {
      es: 'Política de privacidad',
      en: 'Privacy Policy'
    },
    seoDescription: {
      es: 'Cómo protegemos y usamos tu información personal',
      en: 'How we protect and use your personal information'
    },
    content: {
      es: '<p>Información sobre el manejo de datos personales.</p>',
      en: '<p>Information about personal data handling.</p>'
    }
  },
  {
    slug: 'contact',
    type: 'contact',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Contáctanos',
      en: 'Contact Us'
    },
    seoTitle: {
      es: 'Contacto - Ponte en contacto con nosotros',
      en: 'Contact - Get in touch with us'
    },
    seoDescription: {
      es: 'Información de contacto y formulario para mensajes',
      en: 'Contact information and message form'
    },
    content: {
      es: '<p>Formulario de contacto y medios de comunicación.</p>',
      en: '<p>Contact form and communication channels.</p>'
    }
  },
  {
    slug: 'cookies',
    type: 'cookies',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Aviso de cookies',
      en: 'Cookies Notice'
    },
    seoTitle: {
      es: 'Política de cookies',
      en: 'Cookies Policy'
    },
    seoDescription: {
      es: 'Información sobre el uso de cookies en nuestra tienda',
      en: 'Information about cookie usage in our store'
    },
    content: {
      es: '<p>Detalles sobre el uso de cookies en el sitio.</p>',
      en: '<p>Details about cookie usage on the site.</p>'
    }
  },
  {
    slug: 'work-with-us',
    type: 'work-with-us',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Trabaja con nosotros',
      en: 'Work With Us'
    },
    seoTitle: {
      es: 'Oportunidades laborales',
      en: 'Job Opportunities'
    },
    seoDescription: {
      es: 'Únete a nuestro equipo - Oportunidades de trabajo',
      en: 'Join our team - Job opportunities'
    },
    content: {
      es: '<p>Información sobre oportunidades laborales.</p>',
      en: '<p>Information about job opportunities.</p>'
    }
  },
  {
    slug: 'services',
    type: 'services',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Servicios',
      en: 'Services'
    },
    seoTitle: {
      es: 'Nuestros servicios',
      en: 'Our Services'
    },
    seoDescription: {
      es: 'Conoce todos los servicios que ofrecemos',
      en: 'Learn about all the services we offer'
    },
    content: {
      es: '<p>Listado y descripción de nuestros servicios.</p>',
      en: '<p>List and description of our services.</p>'
    }
  }
] 