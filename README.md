# Clínica Digital Pro

Crear desde cero una plataforma web profesional para una clínica médica especializada, con una identidad visual moderna, elegante, médica y tecnológica.

La plataforma debe funcionar como una clínica digital integral, no como una simple página informativa.

Debe incluir:

Sitio público + turnos médicos + portal del paciente + dashboard médico + dashboard de secretaría + panel privado de los directores médicos + control de personal + auditoría + control administrativo.

No utilizar backend en esta etapa. Todo debe funcionar en frontend mediante React, Vite, JavaScript, React Router, localStorage y datos mock, dejando la arquitectura preparada para conectar posteriormente un backend real.

1. IDENTIDAD DE LA CLÍNICA

La clínica estará protagonizada por los hermanos médicos:

DR. CARLOS ALBERTO GÓMEZ BOLAÑO

Especialista en Medicina Interna y Nefrología

Formación:

 Médico Cirujano — Universidad de Guayaquil, Ecuador.

 Especialista en Medicina Interna — Universidad del Zulia, Unidad Docente–Hospital General del Sur, Maracaibo.

 Especialista en Nefrología — Universidad del Zulia, Unidad Docente–Hospital Universitario de Maracaibo.

DR. CARLOS ALONSO GÓMEZ BOLAÑO

Especialista en Medicina Interna y Cardiología

Formación y especialización:

 Medicina Interna.

 Cardiología.

 Magíster en Cardiología Crítica y Ecocardiografía.

2. CONCEPTO

La clínica debe estar especializada principalmente en:

 Medicina Interna.

 Nefrología.

 Cardiología.

 Cardiología Crítica.

 Ecocardiografía.

Debe transmitir:

 Profesionalismo.

 Confianza.

 Tecnología.

 Experiencia.

 Atención personalizada.

 Seguridad.

 Calidad.

No crear una página médica genérica.

Debe sentirse como una clínica privada moderna y profesional.

3. IDENTIDAD VISUAL

Utilizar:

 Azul profundo.

 Azul clínico.

 Blanco.

 Rojo médico como color de acento.

 Gris muy claro.

El diseño debe ser limpio, elegante, premium y tecnológico.

Utilizar elementos visuales relacionados con:

 ECG.

 Corazón.

 Riñón.

 Diagnóstico.

 Medicina interna.

 Tecnología médica.

Utilizar:

 Cards modernas.

 Bordes suaves.

 Sombras discretas.

 Iconos profesionales.

 Espacios amplios.

 Excelente jerarquía visual.

4. HOME

Crear una Home de alto impacto.

HERO

Título:

“Ciencia, experiencia y compromiso con tu salud.”

Subtítulo:

“Atención médica especializada en Medicina Interna, Nefrología y Cardiología.”

Botones:

Solicitar turno

Conocer a nuestros especialistas

Utilizar una fotografía profesional como elemento principal.

FOTOGRAFÍAS

Utilizar inicialmente fotografías temporales/de demostración.

La estructura debe permitir reemplazarlas posteriormente por las fotografías reales de los médicos sin tener que modificar el diseño.

5. HERO DINÁMICO

Crear un carrusel de 3 slides.

Slide 1

Medicina Interna.

Slide 2

Nefrología.

Slide 3

Cardiología.

Cada slide debe tener:

 Imagen.

 Título.

 Descripción.

 CTA.

Autoplay aproximadamente cada 3 segundos.

Agregar controles manuales.

6. NAVBAR PÚBLICO

Crear:

 Inicio.

 Nosotros.

 Especialidades.

 Servicios.

 Clínica.

 Preguntas frecuentes.

 Contacto.

 Turnos.

Acciones:

Iniciar sesión

Solicitar turno

Toda la navegación debe funcionar mediante React Router.

7. NOSOTROS

Crear una página institucional profesional.

Incluir:

 Historia.

 Filosofía de atención.

 Experiencia.

 Atención personalizada.

 Tecnología.

 Diagnóstico integral.

 Seguimiento médico.

Crear una sección especial sobre los hermanos.

8. ESPECIALISTAS

Crear perfiles profesionales.

DR. CARLOS ALBERTO GÓMEZ BOLAÑO

Mostrar:

 Fotografía.

 Nombre.

 Medicina Interna.

 Nefrología.

 Formación.

 Experiencia.

 Áreas de atención.

Botones:

Ver perfil completo

Solicitar turno

DR. CARLOS ALONSO GÓMEZ BOLAÑO

Mostrar:

 Fotografía.

 Nombre.

 Medicina Interna.

 Cardiología.

 Magíster en Cardiología Crítica y Ecocardiografía.

 Experiencia.

 Áreas de atención.

Botones:

Ver perfil completo

Solicitar turno

9. ESPECIALIDADES

Crear páginas/secciones para:

Medicina Interna

Nefrología

Cardiología

Cardiología Crítica

Ecocardiografía

Cada una debe incluir:

 Descripción.

 Qué aborda.

 Cuándo consultar.

 Estudios relacionados.

 Seguimiento.

 Profesional responsable.

10. SERVICIOS

Crear cards para:

 Consulta de Medicina Interna.

 Consulta de Nefrología.

 Consulta de Cardiología.

 Evaluación cardiovascular.

 Evaluación renal.

 Seguimiento de enfermedades crónicas.

 Prevención cardiovascular.

 Estudios cardiológicos.

 Ecocardiografía.

 Segunda opinión médica.

 Seguimiento integral.

Cada servicio debe tener:

 Icono.

 Descripción.

 Duración.

 Precio ficticio.

 Profesional.

 Botón Solicitar turno.

11. CLÍNICA

Crear página institucional.

Mostrar:

 Instalaciones.

 Consultorios.

 Tecnología.

 Equipamiento.

 Atención.

 Información de contacto.

Utilizar fotografías profesionales de ambientes médicos.

12. SISTEMA DE TURNOS

Crear un sistema completo de reserva.

Flujo:

PASO 1

Seleccionar especialidad.

PASO 2

Seleccionar médico.

PASO 3

Seleccionar fecha.

PASO 4

Seleccionar horario.

PASO 5

Completar datos.

PASO 6

Confirmar turno.

Calendario interactivo.

Los horarios ocupados deben aparecer bloqueados.

Estados:

🟢 Disponible

🔵 Seleccionado

🔴 Ocupado

🟣 Confirmado

13. LÓGICA DE DISPONIBILIDAD

La disponibilidad debe depender de los datos simulados.

Si un turno está ocupado:

No permitir reservarlo.

Si una secretaria crea un turno:

Ese horario debe dejar de aparecer disponible.

Si se cancela:

El horario vuelve a estar disponible.

Si se reprograma:

Liberar el horario anterior y ocupar el nuevo.

La lógica debe funcionar realmente con estado y localStorage.

14. PAGO SIMULADO

Después de seleccionar el turno:

Mostrar pantalla de pago ficticio.

Opciones:

 Tarjeta.

 Transferencia.

 Pago digital.

No realizar pagos reales.

Al confirmar:

Pago simulado aprobado.

El turno pasa a confirmado.

15. CONFIRMACIÓN

Mostrar:

¡Tu turno fue confirmado correctamente!

Información:

 Número de turno.

 Médico.

 Especialidad.

 Fecha.

 Hora.

 Modalidad.

 Estado.

Botones:

Ver mi turno

Agregar al calendario

Volver al inicio

16. LOGIN Y REGISTRO

Crear:

 Login.

 Registro.

 Recuperación de contraseña.

Usar datos ficticios y localStorage.

Implementar diferentes roles:

 Paciente.

 Médico.

 Secretaria.

 Director Médico.

17. PORTAL DEL PACIENTE

Ruta:

/paciente

Sidebar:

 Dashboard.

 Mis turnos.

 Solicitar turno.

 Estudios.

 Historia clínica.

 Certificados.

 Documentos.

 Notificaciones.

 Perfil.

 Cerrar sesión.

18. DASHBOARD DEL PACIENTE

Mostrar:

Próximo turno

Médico.

Especialidad.

Fecha.

Hora.

Estado.

Cards:

 Próximos turnos.

 Estudios recientes.

 Documentos.

 Notificaciones.

19. MIS TURNOS

Mostrar:

Próximos turnos

Historial

Permitir:

 Ver detalle.

 Cancelar.

 Reprogramar.

Los cambios deben actualizar realmente el estado del sistema.

20. ESTUDIOS

Crear una sección:

Mis estudios

Mostrar estudios ficticios:

 Laboratorio.

 Ecografía.

 Ecocardiograma.

 Estudios cardiológicos.

 Estudios renales.

Cada estudio debe tener:

 Fecha.

 Profesional.

 Tipo.

 Estado.

 Botón Ver estudio.

21. CERTIFICADOS Y DOCUMENTOS

Crear:

Mis documentos

Mostrar:

 Certificados.

 Informes.

 Recetas ficticias.

 Constancias.

Permitir visualizar documentos simulados.

No utilizar datos médicos reales.

22. DASHBOARD MÉDICO

Crear dashboard exclusivo para los médicos.

Mostrar:

 Pacientes del día.

 Próximos turnos.

 Agenda.

 Consultas.

 Estudios.

 Alertas.

Cada médico debe poder visualizar principalmente sus propios pacientes y agenda, además de las funciones generales que correspondan a su rol.

23. DASHBOARD DE SECRETARÍA

Crear panel específico para recepción.

Sidebar:

 Dashboard.

 Turnos.

 Calendario.

 Pacientes.

 Agenda.

 Pagos.

 Mensajes.

 Mi perfil.

 Cerrar sesión.

Puede:

 Crear turnos.

 Confirmar turnos.

 Reprogramar.

 Cancelar.

 Buscar pacientes.

 Consultar disponibilidad.

Pero tendrá permisos limitados.

🔐 24. PANEL DE LOS DIRECTORES MÉDICOS

Esta es una función fundamental.

Crear un panel exclusivo para:

Dr. Carlos Alberto Gómez Bolaño

y

Dr. Carlos Alonso Gómez Bolaño.

Ambos tendrán un nivel de acceso superior al de la secretaria.

El objetivo es permitir que los hermanos controlen y supervisen directamente toda la operación de la clínica.

25. SIDEBAR DE LOS DIRECTORES

Crear Sidebar profesional:

Dashboard

Turnos

Calendario

Pacientes

Profesionales

Personal

Pagos

Estudios

Historia Clínica

Reportes

Auditoría

Alertas

Seguridad

Configuración

Cerrar sesión

26. DASHBOARD DE LOS DIRECTORES

Mostrar:

Turnos de hoy

Pacientes atendidos

Turnos pendientes

Cancelaciones

Reprogramaciones

Ingresos registrados

Actividad de secretaría

Alertas de seguridad

Nuevos pacientes

Próximos turnos

Crear gráficos:

 Turnos por día.

 Ingresos.

 Especialidades.

 Actividad administrativa.

 Cancelaciones.

 Nuevos pacientes.

27. CONTROL TOTAL DE TURNOS

Los directores deben poder visualizar todos los turnos.

Mostrar:

 Paciente.

 Médico.

 Especialidad.

 Fecha.

 Hora.

 Estado.

 Usuario que creó el turno.

 Fecha de creación.

 Última modificación.

 Pago.

 Estado del pago.

Estados:

🟢 Confirmado

🟡 Pendiente

🔵 Reprogramado

🔴 Cancelado

⚫ Finalizado

🟣 No asistió

28. CONTROL DE SECRETARÍA

Crear:

Personal y Secretaría

Los directores pueden:

 Crear usuarios.

 Editar usuarios.

 Activar/desactivar usuarios.

 Asignar roles.

 Asignar permisos.

 Consultar actividad.

 Revisar operaciones.

Mostrar:

 Nombre.

 Usuario.

 Rol.

 Estado.

 Último acceso.

 Turnos gestionados.

 Actividad.

29. ROLES Y PERMISOS

Implementar un sistema visual de permisos.

SECRETARIA

Puede:

✅ Crear turnos.

✅ Confirmar turnos.

✅ Reprogramar turnos.

✅ Cancelar turnos.

✅ Buscar pacientes.

✅ Consultar agenda.

Pero no puede:

❌ Eliminar historias clínicas.

❌ Modificar información médica.

❌ Crear administradores.

❌ Cambiar sus propios permisos.

❌ Eliminar registros de auditoría.

❌ Modificar pagos confirmados sin autorización.

30. CONTROL DE AGENDA

Los directores pueden configurar:

 Horarios.

 Días de atención.

 Vacaciones.

 Bloqueos.

 Consultorios.

 Duración de consulta.

 Cantidad máxima de pacientes.

La secretaria no podrá modificar la disponibilidad médica sin el permiso correspondiente.

31. CONTROL DE PAGOS

Crear módulo:

Pagos

Mostrar:

 Turno.

 Paciente.

 Importe.

 Método.

 Estado.

 Usuario que registró.

 Fecha.

 Hora.

Estados:

🟢 Pagado

🟡 Pendiente

🔴 Cancelado

Una secretaria no debe poder modificar libremente un pago confirmado.

32. AUTORIZACIÓN DE OPERACIONES SENSIBLES

Para operaciones importantes mostrar:

Esta operación requiere autorización de un director médico.

Aplicarlo a:

 Cancelar turno confirmado.

 Modificar pago.

 Eliminar usuario.

 Modificar permisos.

 Modificar información sensible.

 Operaciones administrativas críticas.

En esta versión frontend, la autorización puede ser simulada.

Registrar quién autorizó.

33. AUDITORÍA

Crear:

Centro de Auditoría

Registrar todas las operaciones importantes.

Ejemplos:

Secretaria creó un turno.

Secretaria modificó un horario.

Secretaria canceló un turno.

Director confirmó un turno.

Director modificó disponibilidad.

Usuario inició sesión.

Usuario modificó información.

Cada registro debe mostrar:

 Usuario.

 Rol.

 Acción.

 Fecha.

 Hora.

 Módulo.

 Registro afectado.

 Estado anterior.

 Estado nuevo.

34. AUDITORÍA INMUTABLE

Los usuarios administrativos no pueden eliminar sus propias acciones de auditoría.

Los registros deben permanecer visibles en la demo.

Permitir filtros por:

 Usuario.

 Fecha.

 Acción.

 Módulo.

 Paciente.

 Número de turno.

35. ALERTAS DE SEGURIDAD

Crear un sistema de alertas para los directores.

Ejemplos:

⚠️ Actividad inusual

“Se detectaron múltiples cancelaciones realizadas por un mismo usuario.”

⚠️ Modificación

“Se modificaron turnos previamente confirmados.”

⚠️ Pago

“Se modificó el estado de un pago.”

⚠️ Usuario

“Se creó un nuevo usuario administrativo.”

⚠️ Acceso

“Nuevo inicio de sesión administrativo.”

Las alertas deben aparecer en el dashboard.

36. DOBLE CONTROL DE LOS HERMANOS

Crear cuentas independientes para ambos directores.

Carlos Alberto

Especialmente relacionado con:

 Medicina Interna.

 Nefrología.

 Gestión general.

Carlos Alonso

Especialmente relacionado con:

 Medicina Interna.

 Cardiología.

 Gestión general.

Ambos deben poder supervisar la operación completa de la clínica.

37. REPORTES

Crear:

Reportes

Mostrar:

 Turnos por período.

 Cancelaciones.

 Reprogramaciones.

 Pacientes nuevos.

 Ingresos simulados.

 Servicios más solicitados.

 Actividad del personal.

 Ocupación de agendas.

Agregar filtros por:

 Día.

 Semana.

 Mes.

 Médico.

 Especialidad.

38. NOTIFICACIONES

Crear notificaciones para cada rol.

Paciente:

Tu turno fue confirmado.

Secretaria:

Nuevo turno solicitado.

Director:

Se detectó una modificación administrativa.

Médico:

Tiene 5 pacientes próximos.

39. MODO OSCURO

Agregar:

Light Mode / Dark Mode

Debe afectar toda la aplicación.

Guardar preferencia en localStorage.

40. BREADCRUMBS

Utilizar breadcrumbs en páginas internas.

Ejemplo:

Inicio / Administración / Turnos

41. BOTÓN VOLVER ARRIBA

Agregar botón flotante para regresar al inicio.

42. RESPONSIVE

La aplicación debe funcionar perfectamente en:

 Desktop.

 Tablet.

 Mobile.

Los dashboards deben ser completamente responsive.

43. RUTAS

Crear:

/
 /nosotros
 /especialidades
 /servicios
 /clinica
 /preguntas-frecuentes
 /contacto
 /turnos
 /login
 /registro

 /paciente
 /paciente/turnos
 /paciente/estudios
 /paciente/historia-clinica
 /paciente/certificados
 /paciente/documentos

 /medico

 /secretaria

 /director
 /director/turnos
 /director/calendario
 /director/pacientes
 /director/profesionales
 /director/personal
 /director/pagos
 /director/reportes
 /director/auditoria
 /director/alertas
 /director/seguridad
 /director/configuracion

44. REGLA FUNDAMENTAL

NINGÚN BOTÓN PUEDE SER DECORATIVO.

Todo botón debe realizar una acción real dentro de la demo.

Por ejemplo:

Solicitar turno → abre el sistema de turnos.

Confirmar → confirma.

Cancelar → cancela.

Reprogramar → cambia fecha/hora.

Agregar → agrega.

Editar → modifica.

Eliminar → elimina cuando el rol tenga permiso.

Autorizar → registra autorización.

Auditoría → muestra actividad.

Login → inicia sesión.

Cerrar sesión → termina la sesión.

45. LOCALSTORAGE

Utilizar localStorage para simular:

 Usuarios.

 Sesiones.

 Roles.

 Permisos.

 Turnos.

 Calendarios.

 Pacientes ficticios.

 Estudios ficticios.

 Documentos ficticios.

 Pagos ficticios.

 Auditoría.

 Notificaciones.

 Configuración.

46. SEGURIDAD DE LA DEMO

Aunque no existe backend todavía, la aplicación debe simular correctamente el control de roles y permisos.

No presentar localStorage como seguridad real.

La estructura debe quedar preparada para que posteriormente:

Frontend → API → Backend → Base de datos

reemplace la lógica simulada.

No almacenar información médica real.

Utilizar exclusivamente datos ficticios.

47. TECNOLOGÍA

Utilizar:

 React.

 Vite.

 JavaScript.

 React Router.

 CSS moderno.

 Lucide React.

No utilizar backend en esta etapa.

No crear una aplicación monolítica.

48. ARQUITECTURA

Organizar:

src/
├── components/
├── pages/
├── layouts/
├── dashboards/
├── data/
├── hooks/
├── context/
├── utils/
├── services/
├── styles/
└── assets/

Crear componentes reutilizables.

Separar claramente:

 Público.

 Paciente.

 Médico.

 Secretaría.

 Director.

49. EXPERIENCIA FINAL

El recorrido completo debe ser:

Visitante

↓

Conoce la clínica

↓

Conoce a los hermanos

↓

Consulta especialidades

↓

Solicita turno

↓

Selecciona médico

↓

Selecciona fecha

↓

Selecciona horario

↓

Confirma

↓

Pago simulado

↓

Turno confirmado

↓

Paciente inicia sesión

↓

Consulta sus turnos

↓

Consulta estudios y documentos

↓

Médico ingresa

↓

Consulta agenda

↓

Secretaria administra turnos

↓

Director ingresa

↓

Supervisa turnos

↓

Controla personal

↓

Controla pagos

↓

Revisa auditoría

↓

Revisa alertas

↓

Analiza reportes

OBJETIVO FINAL

El resultado debe parecer una verdadera plataforma digital de una clínica privada moderna, no una plantilla médica.

Debe combinar:

🏥 Sitio institucional

📅 Sistema de turnos

👤 Portal del paciente

👨‍⚕️ Portal médico

👩‍💼 Panel de secretaría

🔐 Panel de directores médicos

📊 Administración

🔎 Auditoría

🛡️ Roles y permisos

🚨 Alertas

💳 Control de pagos

📈 Reportes

Y especialmente:

Los dos hermanos médicos deben conservar el control superior de la plataforma, pudiendo supervisar la actividad de la secretaría y del resto del personal, controlar los turnos, revisar modificaciones, gestionar permisos y consultar la auditoría de operaciones.

La finalidad es crear una demo profesional de una clínica digital, con una arquitectura frontend preparada para posteriormente incorporar autenticación, backend, base de datos, almacenamiento seguro de documentos y demás servicios reales.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/83b9e831-3c94-4b98-bec8-5a3fa5c9265a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
