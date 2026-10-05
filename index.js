'use strict';

/* ==================================================
   00. UTILITÁRIOS E CONSTANTES GERAIS
================================================== */

// Verifica se o usuário prefere movimento reduzido — respeitado em todas as animações
const prefereMovimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Atalho para querySelector / querySelectorAll
const $ = (seletor, escopo = document) => escopo.querySelector(seletor);
const $$ = (seletor, escopo = document) => Array.from(escopo.querySelectorAll(seletor));

document.addEventListener('DOMContentLoaded', () => {
  inicializarHeaderScroll();
  inicializarMenuMobile();
  inicializarScrollSuaveEItemAtivo();
  inicializarAnimacoesEntrada();
  inicializarHeroCarregado();
  inicializarModalTratamentos();
  inicializarModalEquipe();
  inicializarModalPrivacidade();
  inicializarComparadorAntesDepois();
  inicializarLightbox();
  inicializarSliderDepoimentos();
  inicializarAccordionFAQ();
  inicializarFormularioContato();
  inicializarWhatsApp();
  inicializarBotaoVoltarTopo();
  inicializarAnoRodape();
});

/* ==================================================
   01. HEADER — ALTERAÇÃO AO ROLAR A PÁGINA
================================================== */
function inicializarHeaderScroll() {
  const header = $('#header');
  if (!header) return;

  const LIMITE_SCROLL = 40;

  const atualizarHeader = () => {
    if (window.scrollY > LIMITE_SCROLL) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  };

  atualizarHeader();
  window.addEventListener('scroll', atualizarHeader, { passive: true });
}

/* ==================================================
   02. MENU MOBILE
================================================== */
function inicializarMenuMobile() {
  const botaoHamburger = $('#hamburger-btn');
  const menu = $('#menu-mobile');
  const overlay = $('#menu-overlay');
  if (!botaoHamburger || !menu || !overlay) return;

  const linksMenu = $$('[data-nav-link]', menu);

  function abrirMenu() {
    menu.classList.add('is-open');
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
    botaoHamburger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-aberto');
  }

  function fecharMenu() {
    menu.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    botaoHamburger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-aberto');
    setTimeout(() => { overlay.hidden = true; }, 320);
  }

  botaoHamburger.addEventListener('click', () => {
    const estaAberto = menu.classList.contains('is-open');
    estaAberto ? fecharMenu() : abrirMenu();
  });

  overlay.addEventListener('click', fecharMenu);

  linksMenu.forEach((link) => {
    link.addEventListener('click', fecharMenu);
  });

  // Fechar com a tecla Escape
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && menu.classList.contains('is-open')) {
      fecharMenu();
    }
  });
}

/* ==================================================
   03. SCROLL SUAVE E ITEM ATIVO NO MENU
================================================== */
function inicializarScrollSuaveEItemAtivo() {
  const linksNavegacao = $$('[data-nav-link]');
  const secoes = $$('main section[id]');

  linksNavegacao.forEach((link) => {
    link.addEventListener('click', (evento) => {
      const destino = link.getAttribute('href');
      if (!destino || !destino.startsWith('#')) return;
      const alvo = $(destino);
      if (!alvo) return;

      evento.preventDefault();
      const alturaHeader = $('#header').offsetHeight;
      const posicao = alvo.getBoundingClientRect().top + window.scrollY - alturaHeader + 1;

      window.scrollTo({
        top: posicao,
        behavior: prefereMovimentoReduzido ? 'auto' : 'smooth'
      });
    });
  });

  if (!('IntersectionObserver' in window) || secoes.length === 0) return;

  const linksHeader = $$('.header__nav-link');

  const observadorSecoes = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        const idAtual = entrada.target.getAttribute('id');

        linksHeader.forEach((link) => {
          const correspondeAoId = link.getAttribute('href') === `#${idAtual}`;
          link.classList.toggle('is-active', correspondeAoId);
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  secoes.forEach((secao) => observadorSecoes.observe(secao));
}

/* ==================================================
   04. ANIMAÇÕES DE ENTRADA (INTERSECTION OBSERVER)
================================================== */
function inicializarAnimacoesEntrada() {
  const elementosAnimados = $$('[data-animate]');
  if (elementosAnimados.length === 0) return;

  if (prefereMovimentoReduzido || !('IntersectionObserver' in window)) {
    elementosAnimados.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          obs.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elementosAnimados.forEach((el) => observador.observe(el));

  // Diferenciais e timeline usam a mesma técnica, mas com seletor próprio
  const itensDiferenciais = $$('.item-diferencial, .timeline__item');
  itensDiferenciais.forEach((el) => observador.observe(el));
}

/* ==================================================
   05. HERO — EFEITO DE ZOOM SUTIL AO CARREGAR
================================================== */
function inicializarHeroCarregado() {
  const hero = $('.hero');
  if (!hero) return;

  requestAnimationFrame(() => {
    hero.classList.add('is-loaded');
  });
}

/* ==================================================
   06. MODAL DE TRATAMENTOS (ALIMENTADO POR DATA ATTRIBUTES)
================================================== */
const DADOS_TRATAMENTOS = {
  lentes: {
    titulo: 'Lentes de contato dental',
    descricao: 'As lentes de contato dental são peças finas, personalizadas conforme as características de cada paciente, utilizadas para ajustes estéticos no sorriso. A espessura, o formato e a indicação variam de caso a caso.'
  },
  implantes: {
    titulo: 'Implantes dentários',
    descricao: 'Os implantes dentários são uma alternativa para repor dentes ausentes, restabelecendo função e estética conforme o planejamento definido após avaliação clínica individual.'
  },
  invisalign: {
    titulo: 'Invisalign e alinhadores transparentes',
    descricao: 'Os alinhadores transparentes permitem a movimentação gradual dos dentes de forma discreta, com acompanhamento contínuo da profissional responsável.'
  },
  canal: {
    titulo: 'Tratamento de canal',
    descricao: 'O tratamento de canal (endodontia) atua na estrutura interna do dente, buscando preservar sua função e evitar a necessidade de extração, sempre conforme diagnóstico individual.'
  },
  reabilitacao: {
    titulo: 'Reabilitação oral',
    descricao: 'A reabilitação oral reúne diferentes procedimentos para recuperar a função mastigatória e o equilíbrio da boca como um todo, a partir de um planejamento amplo e individualizado.'
  },
  estetica: {
    titulo: 'Odontologia estética',
    descricao: 'A odontologia estética reúne procedimentos voltados à harmonização do sorriso, sempre respeitando as características e expectativas de cada paciente, avaliadas individualmente.'
  },
  avaliacao: {
    titulo: 'Avaliação e prevenção',
    descricao: 'A avaliação odontológica é o ponto de partida de qualquer tratamento, permitindo identificar as necessidades específicas de cada paciente e orientar sobre prevenção.'
  },
  outros: {
    titulo: 'Outros tratamentos odontológicos',
    descricao: 'Além dos tratamentos listados, a equipe pode avaliar outras necessidades odontológicas conforme o caso apresentado, sempre mediante avaliação presencial.'
  }
};

function inicializarModalTratamentos() {
  const overlay = $('#modal-tratamento');
  if (!overlay) return;

  const modal = $('.modal', overlay);
  const tituloEl = $('#modal-titulo');
  const corpoEl = $('#modal-corpo');
  const botaoFechar = $('#modal-close');
  const gatilhos = $$('[data-modal-trigger]');

  let elementoQueAbriu = null;

  function abrirModal(chave) {
    const dados = DADOS_TRATAMENTOS[chave];
    if (!dados) return;

    tituloEl.textContent = dados.titulo;
    corpoEl.textContent = dados.descricao;

    elementoQueAbriu = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
    modal.focus();
    document.body.classList.add('menu-aberto');
  }

  function fecharModal() {
    overlay.classList.remove('is-visible');
    document.body.classList.remove('menu-aberto');
    setTimeout(() => {
      overlay.hidden = true;
      if (elementoQueAbriu) elementoQueAbriu.focus();
    }, 260);
  }

  gatilhos.forEach((gatilho) => {
    gatilho.addEventListener('click', () => abrirModal(gatilho.dataset.modalTrigger));
    // Permitir abrir pelo teclado quando o gatilho é o card inteiro (tabindex)
    gatilho.addEventListener('keydown', (evento) => {
      if ((evento.key === 'Enter' || evento.key === ' ') && gatilho.classList.contains('card-tratamento')) {
        evento.preventDefault();
        abrirModal(gatilho.dataset.modalTrigger);
      }
    });
  });

  botaoFechar.addEventListener('click', fecharModal);

  overlay.addEventListener('click', (evento) => {
    if (evento.target === overlay) fecharModal();
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && !overlay.hidden) fecharModal();
  });

  // Controle simples de foco (trap) dentro do modal
  modal.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Tab') return;
    const focaveis = $$('button, a[href]', modal);
    if (focaveis.length === 0) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];

    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  });
}

/* ==================================================
   07. MODAL / EXPANSÃO DA EQUIPE
================================================== */
const DADOS_EQUIPE = {
  walter: {
    titulo: 'Dr. Walter de Castro e Lima',
    // ATUALIZAR: caso a clínica queira uma biografia expandida específica para este modal
    descricao: 'Formado em Odontologia pela Universidade Santo Amaro (UNISA) em 1992, com mais de 30 anos de experiência profissional. Atua principalmente com lentes de contato dental, implantes dentários, reabilitação oral e odontologia estética.'
  },
  invisalign: {
    titulo: 'Dra. Nome da Profissional (placeholder)',
    // ATUALIZAR: substituir por biografia real assim que informações forem fornecidas
    descricao: 'Profissional responsável pelos tratamentos com Invisalign e alinhadores transparentes. Formação e tempo de experiência serão informados em breve.'
  },
  endodontia: {
    titulo: 'Dra. Nome da Profissional (placeholder)',
    // ATUALIZAR: substituir por biografia real assim que informações forem fornecidas
    descricao: 'Profissional responsável pela Endodontia e tratamento de canal. Formação e tempo de experiência serão informados em breve.'
  }
};

function inicializarModalEquipe() {
  const overlay = $('#modal-equipe');
  if (!overlay) return;

  const modal = $('.modal', overlay);
  const tituloEl = $('#modal-equipe-titulo');
  const corpoEl = $('#modal-equipe-corpo');
  const botaoFechar = $('#modal-equipe-close');
  const gatilhos = $$('[data-equipe-trigger]');

  let elementoQueAbriu = null;

  function abrirModal(chave) {
    const dados = DADOS_EQUIPE[chave];
    if (!dados) return;

    tituloEl.textContent = dados.titulo;
    corpoEl.textContent = dados.descricao;

    elementoQueAbriu = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
    modal.focus();
    document.body.classList.add('menu-aberto');
  }

  function fecharModal() {
    overlay.classList.remove('is-visible');
    document.body.classList.remove('menu-aberto');
    setTimeout(() => {
      overlay.hidden = true;
      if (elementoQueAbriu) elementoQueAbriu.focus();
    }, 260);
  }

  gatilhos.forEach((gatilho) => {
    gatilho.addEventListener('click', () => abrirModal(gatilho.dataset.equipeTrigger));
  });

  botaoFechar.addEventListener('click', fecharModal);

  overlay.addEventListener('click', (evento) => {
    if (evento.target === overlay) fecharModal();
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && !overlay.hidden) fecharModal();
  });
}

/* ==================================================
   08. MODAL DE POLÍTICA DE PRIVACIDADE
================================================== */
function inicializarModalPrivacidade() {
  const overlay = $('#modal-privacidade');
  if (!overlay) return;

  const modal = $('.modal', overlay);
  const botaoFechar = $('#modal-privacidade-close');
  const gatilhos = [$('#abrir-privacidade'), $('#footer-abrir-privacidade')].filter(Boolean);

  let elementoQueAbriu = null;

  function abrirModal() {
    elementoQueAbriu = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
    modal.focus();
    document.body.classList.add('menu-aberto');
  }

  function fecharModal() {
    overlay.classList.remove('is-visible');
    document.body.classList.remove('menu-aberto');
    setTimeout(() => {
      overlay.hidden = true;
      if (elementoQueAbriu) elementoQueAbriu.focus();
    }, 260);
  }

  gatilhos.forEach((gatilho) => gatilho.addEventListener('click', abrirModal));
  botaoFechar.addEventListener('click', fecharModal);

  overlay.addEventListener('click', (evento) => {
    if (evento.target === overlay) fecharModal();
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && !overlay.hidden) fecharModal();
  });
}

/* ==================================================
   09. COMPARADOR ANTES E DEPOIS (ARRASTAR DIVISÓRIA)
================================================== */
function inicializarComparadorAntesDepois() {
  const comparadores = $$('[data-comparador]');
  if (comparadores.length === 0) return;

  comparadores.forEach((comparador) => {
    const frame = $('.comparador__frame', comparador);
    const depoisWrap = $('[data-comparador-depois]', comparador);
    const handle = $('[data-comparador-handle]', comparador);
    if (!frame || !depoisWrap || !handle) return;

    let arrastando = false;

    function atualizarPosicao(percentual) {
      const limitado = Math.min(100, Math.max(0, percentual));
      depoisWrap.style.width = `${limitado}%`;
      handle.style.left = `${limitado}%`;
      handle.setAttribute('aria-valuenow', String(Math.round(limitado)));

      // Ajusta a largura da imagem interna para manter o alinhamento visual
      const imgDepois = $('.comparador__img--depois', depoisWrap);
      if (imgDepois) {
        const larguraFrame = frame.offsetWidth;
        imgDepois.style.width = `${larguraFrame}px`;
      }
    }

    function calcularPercentualPeloEvento(clienteX) {
      const retangulo = frame.getBoundingClientRect();
      const posicaoRelativa = clienteX - retangulo.left;
      return (posicaoRelativa / retangulo.width) * 100;
    }

    function aoMoverMouse(evento) {
      if (!arrastando) return;
      atualizarPosicao(calcularPercentualPeloEvento(evento.clientX));
    }

    function aoMoverToque(evento) {
      if (!arrastando || !evento.touches[0]) return;
      atualizarPosicao(calcularPercentualPeloEvento(evento.touches[0].clientX));
    }

    function pararArraste() {
      arrastando = false;
    }

    handle.addEventListener('mousedown', () => { arrastando = true; });
    frame.addEventListener('mousedown', (evento) => {
      arrastando = true;
      atualizarPosicao(calcularPercentualPeloEvento(evento.clientX));
    });
    window.addEventListener('mousemove', aoMoverMouse);
    window.addEventListener('mouseup', pararArraste);

    handle.addEventListener('touchstart', () => { arrastando = true; }, { passive: true });
    frame.addEventListener('touchstart', (evento) => {
      arrastando = true;
      if (evento.touches[0]) atualizarPosicao(calcularPercentualPeloEvento(evento.touches[0].clientX));
    }, { passive: true });
    window.addEventListener('touchmove', aoMoverToque, { passive: true });
    window.addEventListener('touchend', pararArraste);

    // Suporte a teclado (setas esquerda/direita)
    handle.addEventListener('keydown', (evento) => {
      const valorAtual = Number(handle.getAttribute('aria-valuenow')) || 50;
      if (evento.key === 'ArrowLeft') {
        evento.preventDefault();
        atualizarPosicao(valorAtual - 5);
      } else if (evento.key === 'ArrowRight') {
        evento.preventDefault();
        atualizarPosicao(valorAtual + 5);
      }
    });

    // Posição inicial
    atualizarPosicao(50);
    window.addEventListener('resize', () => {
      const valorAtual = Number(handle.getAttribute('aria-valuenow')) || 50;
      atualizarPosicao(valorAtual);
    });
  });
}

/* ==================================================
   10. LIGHTBOX DE IMAGENS
================================================== */
function inicializarLightbox() {
  const overlay = $('#lightbox');
  if (!overlay) return;

  const imagemLightbox = $('#lightbox-image');
  const botaoFechar = $('#lightbox-close');
  const gatilhos = $$('[data-lightbox-trigger]');

  let elementoQueAbriu = null;

  function abrirLightbox(nomeImagem) {
    elementoQueAbriu = document.activeElement;
    // ATUALIZAR: caminho da imagem correspondente ao caso clínico selecionado
    imagemLightbox.src = `assets/images/${nomeImagem}.jpg`;
    imagemLightbox.alt = 'Imagem ampliada do caso clínico demonstrativo';
    overlay.hidden = false;
    botaoFechar.focus();
    document.body.classList.add('menu-aberto');
  }

  function fecharLightbox() {
    overlay.hidden = true;
    imagemLightbox.src = '';
    document.body.classList.remove('menu-aberto');
    if (elementoQueAbriu) elementoQueAbriu.focus();
  }

  gatilhos.forEach((gatilho) => {
    gatilho.addEventListener('click', () => abrirLightbox(gatilho.dataset.lightboxTrigger));
  });

  botaoFechar.addEventListener('click', fecharLightbox);

  overlay.addEventListener('click', (evento) => {
    if (evento.target === overlay) fecharLightbox();
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && !overlay.hidden) fecharLightbox();
  });
}

/* ==================================================
   11. SLIDER DE DEPOIMENTOS
================================================== */
function inicializarSliderDepoimentos() {
  const slider = $('[data-slider]');
  if (!slider) return;

  const track = $('[data-slider-track]', slider);
  const slides = $$('[data-slide]', track);
  const botaoAnterior = $('#slider-prev');
  const botaoProximo = $('#slider-next');
  const containerIndicadores = $('#slider-indicadores');

  if (slides.length === 0) return;

  let indiceAtual = 0;
  let intervaloAutoplay = null;
  const TEMPO_AUTOPLAY = 7000;

  // Criação dos indicadores
  slides.forEach((_, indice) => {
    const indicador = document.createElement('button');
    indicador.classList.add('depoimentos__indicador');
    indicador.setAttribute('role', 'tab');
    indicador.setAttribute('aria-label', `Ir para o depoimento ${indice + 1}`);
    indicador.addEventListener('click', () => {
      irParaSlide(indice);
      pausarAutoplay();
    });
    containerIndicadores.appendChild(indicador);
  });

  const indicadores = $$('.depoimentos__indicador', containerIndicadores);

  function atualizarIndicadores() {
    indicadores.forEach((ind, indice) => {
      ind.classList.toggle('is-ativo', indice === indiceAtual);
    });
  }

  function irParaSlide(indice) {
    indiceAtual = (indice + slides.length) % slides.length;
    const deslocamento = indiceAtual * -100;
    track.style.transform = `translateX(${deslocamento}%)`;
    atualizarIndicadores();

    // Pausa vídeos que não estão em exibição
    $$('video', track).forEach((video) => video.pause());
  }

  function iniciarAutoplay() {
    if (prefereMovimentoReduzido) return;
    intervaloAutoplay = setInterval(() => irParaSlide(indiceAtual + 1), TEMPO_AUTOPLAY);
  }

  function pausarAutoplay() {
    if (intervaloAutoplay) clearInterval(intervaloAutoplay);
  }

  botaoAnterior.addEventListener('click', () => {
    irParaSlide(indiceAtual - 1);
    pausarAutoplay();
  });

  botaoProximo.addEventListener('click', () => {
    irParaSlide(indiceAtual + 1);
    pausarAutoplay();
  });

  // Pausa o autoplay quando o usuário interage com o slider (foco, toque, hover)
  ['mouseenter', 'focusin', 'touchstart'].forEach((evt) => {
    slider.addEventListener(evt, pausarAutoplay, { passive: true });
  });

  // Suporte a teclado
  slider.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowLeft') {
      irParaSlide(indiceAtual - 1);
      pausarAutoplay();
    } else if (evento.key === 'ArrowRight') {
      irParaSlide(indiceAtual + 1);
      pausarAutoplay();
    }
  });

  // Suporte a toque (swipe)
  let posicaoInicialToque = null;
  track.addEventListener('touchstart', (evento) => {
    posicaoInicialToque = evento.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (evento) => {
    if (posicaoInicialToque === null) return;
    const diferenca = evento.changedTouches[0].clientX - posicaoInicialToque;
    if (Math.abs(diferenca) > 50) {
      diferenca > 0 ? irParaSlide(indiceAtual - 1) : irParaSlide(indiceAtual + 1);
      pausarAutoplay();
    }
    posicaoInicialToque = null;
  });

  irParaSlide(0);
  iniciarAutoplay();
}

/* ==================================================
   12. ACCORDION DE PERGUNTAS FREQUENTES
================================================== */
function inicializarAccordionFAQ() {
  const accordion = $('[data-accordion]');
  if (!accordion) return;

  const gatilhos = $$('.accordion__trigger', accordion);

  gatilhos.forEach((gatilho) => {
    gatilho.addEventListener('click', () => {
      const painel = $(`#${gatilho.getAttribute('aria-controls')}`);
      const estaExpandido = gatilho.getAttribute('aria-expanded') === 'true';

      gatilho.setAttribute('aria-expanded', String(!estaExpandido));
      painel.hidden = estaExpandido;
    });
  });
}

/* ==================================================
   13. MÁSCARA DE TELEFONE BRASILEIRO
================================================== */
function aplicarMascaraTelefone(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);

  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

/* ==================================================
   14. VALIDAÇÃO E ENVIO DO FORMULÁRIO DE CONTATO
================================================== */
function inicializarFormularioContato() {
  const formulario = $('#form-contato');
  if (!formulario) return;

  const campoNome = $('#nome', formulario);
  const campoTelefone = $('#telefone', formulario);
  const campoEmail = $('#email', formulario);
  const campoTratamento = $('#tratamento', formulario);
  const campoConsentimento = $('#consentimento', formulario);
  const campoHoneypot = $('#site-web', formulario);
  const botaoEnviar = $('#form-submit-btn', formulario);
  const areaFeedback = $('#form-feedback', formulario);

  // Máscara de telefone em tempo real
  campoTelefone.addEventListener('input', () => {
    campoTelefone.value = aplicarMascaraTelefone(campoTelefone.value);
  });

  function definirErro(campo, mensagem) {
    const grupo = campo.closest('.form-grupo');
    const elementoErro = $(`#erro-${campo.id}`);
    if (grupo) grupo.classList.toggle('is-invalido', Boolean(mensagem));
    if (elementoErro) elementoErro.textContent = mensagem || '';
  }

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validarTelefone(telefone) {
    const numeros = telefone.replace(/\D/g, '');
    return numeros.length === 10 || numeros.length === 11;
  }

  function validarFormulario() {
    let valido = true;

    if (!campoNome.value.trim()) {
      definirErro(campoNome, 'Informe seu nome completo.');
      valido = false;
    } else {
      definirErro(campoNome, '');
    }

    if (!validarTelefone(campoTelefone.value)) {
      definirErro(campoTelefone, 'Informe um telefone válido com DDD.');
      valido = false;
    } else {
      definirErro(campoTelefone, '');
    }

    if (!validarEmail(campoEmail.value.trim())) {
      definirErro(campoEmail, 'Informe um e-mail válido.');
      valido = false;
    } else {
      definirErro(campoEmail, '');
    }

    if (!campoTratamento.value) {
      definirErro(campoTratamento, 'Selecione um tratamento de interesse.');
      valido = false;
    } else {
      definirErro(campoTratamento, '');
    }

    if (!campoConsentimento.checked) {
      definirErro(campoConsentimento, 'É necessário concordar com o uso dos dados para continuar.');
      valido = false;
    } else {
      definirErro(campoConsentimento, '');
    }

    return valido;
  }

  function exibirFeedback(tipo, mensagem) {
    areaFeedback.hidden = false;
    areaFeedback.textContent = mensagem;
    areaFeedback.className = `form-feedback form-feedback--${tipo}`;
  }

  function alternarEstadoCarregamento(carregando) {
    const textoNormal = $('.form-submit__texto', botaoEnviar);
    const textoCarregando = $('.form-submit__loading', botaoEnviar);

    botaoEnviar.disabled = carregando;
    textoNormal.hidden = carregando;
    textoCarregando.hidden = !carregando;
  }

  function tratarEnvioFormulario(evento) {
    evento.preventDefault();

    // Honeypot: se preenchido, é provavelmente um robô — ignora silenciosamente
    if (campoHoneypot.value.trim() !== '') {
      formulario.reset();
      return;
    }

    if (!validarFormulario()) {
      exibirFeedback('erro', 'Verifique os campos destacados antes de enviar.');
      return;
    }

    alternarEstadoCarregamento(true);
    areaFeedback.hidden = true;

    // ==================================================
    // INTEGRAÇÃO FUTURA COM API / SERVIÇO DE FORMULÁRIO
    // Este projeto não possui back-end. Nenhum dado é
    // enviado a servidores externos nesta demonstração.
    // Para produção, substituir o bloco abaixo por uma
    // chamada real, por exemplo:
    //
    // fetch('https://sua-api.com/contato', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ nome, telefone, email, ... })
    // })
    //   .then(...)
    //   .catch(...);
    // ==================================================
    setTimeout(() => {
      alternarEstadoCarregamento(false);
      exibirFeedback(
        'sucesso',
        'Esta é uma versão de demonstração: o envio ainda precisa ser integrado a um serviço de formulário. Enquanto isso, você pode continuar o atendimento diretamente pelo WhatsApp.'
      );
      formulario.reset();
    }, 900);
  }

  formulario.addEventListener('submit', tratarEnvioFormulario);
}

/* ==================================================
   15. BOTÃO FLUTUANTE DE WHATSAPP
================================================== */
function inicializarWhatsApp() {
  const botaoFlutuante = $('#whatsapp-flutuante');
  const botaoCtaFinal = $('#cta-whatsapp');
  const botaoFooter = $('#footer-whatsapp');

  if (!botaoFlutuante) return;

  // ATUALIZAR: número fictício de WhatsApp — substituir pelo número real da clínica
  const numero = botaoFlutuante.dataset.whatsappNumero;
  const mensagem = botaoFlutuante.dataset.whatsappMensagem;
  const urlWhatsApp = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  botaoFlutuante.setAttribute('href', urlWhatsApp);
  if (botaoCtaFinal) botaoCtaFinal.setAttribute('href', urlWhatsApp);
  if (botaoFooter) botaoFooter.setAttribute('href', urlWhatsApp);
}

/* ==================================================
   16. BOTÃO VOLTAR AO TOPO
================================================== */
function inicializarBotaoVoltarTopo() {
  const botao = $('#btn-voltar-topo');
  if (!botao) return;

  const LIMITE_EXIBICAO = 480;

  window.addEventListener('scroll', () => {
    botao.hidden = window.scrollY <= LIMITE_EXIBICAO;
    if (window.scrollY > LIMITE_EXIBICAO) {
      requestAnimationFrame(() => botao.classList.add('is-visible'));
    } else {
      botao.classList.remove('is-visible');
    }
  }, { passive: true });

  botao.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefereMovimentoReduzido ? 'auto' : 'smooth' });
  });
}

/* ==================================================
   17. ANO ATUAL AUTOMÁTICO NO RODAPÉ
================================================== */
function inicializarAnoRodape() {
  const elementoAno = $('#ano-atual');
  if (!elementoAno) return;
  elementoAno.textContent = String(new Date().getFullYear());
}