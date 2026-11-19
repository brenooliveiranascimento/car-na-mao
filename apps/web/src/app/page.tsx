import { site } from "@/lib/site";

const steps = [
  {
    title: "Entende a notificação",
    text: "Cada pendência do CAR vira uma explicação curta, em linguagem simples e em áudio: o que fazer, quais documentos separar e qual o prazo.",
  },
  {
    title: "Caminha pelo limite",
    text: "Sem internet, o produtor percorre a cerca com o celular. O GPS registra o limite real do terreno, e nada se perde se o sinal cair.",
  },
  {
    title: "Responde com segurança",
    text: "A caminhada é comparada com o mapa declarado e com os vizinhos. O produtor vê onde está a sobreposição e sabe se deve corrigir o mapa ou juntar documentos.",
  },
];

const principles = [
  ["Código aberto", "Licença Apache 2.0. O governo pode instalar, auditar e evoluir sem depender de fornecedor."],
  ["Dentro do ecossistema oficial", "Pensado para funcionar com o Meu Imóvel Rural e o Sicar, sem criar um aplicativo paralelo."],
  ["Funciona sem internet", "Dados e caminhadas ficam salvos no celular e são enviados quando houver sinal."],
  ["Quem decide é o órgão", "A ferramenta orienta e organiza a resposta. A análise e a decisão continuam com o órgão estadual."],
  ["Acessível", "Textos curtos, áudio, botões grandes e alto contraste, seguindo eMAG e WCAG 2.2 AA."],
  ["IA com base em fontes oficiais", "As explicações se apoiam no texto da notificação e na legislação, citam a fonte e não inventam exigências."],
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12 flex flex-col gap-16">
      <header className="flex flex-col gap-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">InovaCAR · Desafio 1</p>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          O CAR explicado e resolvido pelo celular, até onde não tem sinal.
        </h1>
        <p className="text-xl leading-relaxed text-muted">
          Cerca de 600 mil cadastros já analisados aguardam resposta do produtor. A maioria é de pequenos imóveis, de quem
          recebe uma notificação técnica e não sabe por onde começar. O CAR na Mão leva a retificação até o produtor.
        </p>
        <div className="flex flex-wrap gap-4">
          <a href={site.repositoryUrl} className="rounded-xl bg-primary px-6 py-4 text-lg font-bold text-white">
            Ver o código no GitHub
          </a>
          <a href="#como-funciona" className="rounded-xl border-2 border-primary px-6 py-4 text-lg font-bold text-primary">
            Como funciona
          </a>
        </div>
      </header>

      <section id="como-funciona" className="flex flex-col gap-6" aria-labelledby="como-funciona-titulo">
        <h2 id="como-funciona-titulo" className="text-3xl font-bold">Como funciona</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-2">
              <span className="text-sm font-bold text-primary">Passo {i + 1}</span>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-lg leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-6" aria-labelledby="principios-titulo">
        <h2 id="principios-titulo" className="text-3xl font-bold">Princípios</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {principles.map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-black/10 bg-white p-6">
              <dt className="text-xl font-bold">{title}</dt>
              <dd className="mt-2 text-lg leading-relaxed text-muted">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl bg-primary p-8 text-white flex flex-col gap-3" aria-labelledby="status-titulo">
        <h2 id="status-titulo" className="text-2xl font-bold">Estágio atual: protótipo funcional (MVP)</h2>
        <p className="text-lg leading-relaxed">
          App mobile com explicação em áudio, coleta de limite offline e comparação com o mapa declarado e os vizinhos, calculada
          com PostGIS. Integrações com o Meu Imóvel Rural, o Sicar e o login gov.br estão previstas para a fase de aceleração.
        </p>
        <p className="text-base opacity-90">Os dados exibidos na demonstração são fictícios.</p>
      </section>

      <footer className="border-t border-black/10 pt-6 text-muted flex flex-col gap-1">
        <p>CAR na Mão · código aberto sob licença Apache 2.0.</p>
        {site.contactEmail && (
          <p>
            Contato: <a className="underline" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
          </p>
        )}
      </footer>
    </main>
  );
}
