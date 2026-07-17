/**
 * Client-side presentation for the test player's exam-integrity flags
 * (question watermark, paste/copy blocking, text-selection blocking).
 *
 * The flags themselves, and the resulting CSS classes / data attributes on
 * #tst_output, are controlled server-side per test. This module only reacts
 * to what is already present in the DOM and is a no-op wherever #tst_output
 * does not exist, so it is safe to load on every page.
 *
 * None of this is a security control - it only deters casual copy/paste and
 * screenshot sharing, and is trivially bypassed via devtools, browser
 * extensions, or a second device. Exam integrity has to be enforced
 * organisationally, not by client-side script.
 */
il.Util.addOnLoad(() => {
  const tstOutput = document.getElementById('tst_output');
  if (!tstOutput) {
    return;
  }

  const swapToAlertFavicon = () => {
    const link = document.getElementById('custom_favicon');
    if (!link) {
      return;
    }
    const cacheBuster = Math.random().toString(36).substring(7);
    link.href = `./Customizing/global/skin/uoc/skin_assessment/images/favicons/anticheat/favicon.ico?v=${cacheBuster}`;
  };

  const setupWatermark = () => {
    const activeId = tstOutput.getAttribute('data-active-id') || '';
    const login = tstOutput.getAttribute('data-login') || '';
    const label = login ? `${activeId} - ${login}` : activeId;

    const svgLabel = document.getElementById('test-active-svg-content');
    const svgElement = document.getElementById('test-active-svg');
    if (svgLabel && svgElement) {
      svgLabel.textContent = label;
      const svgMarkup = new XMLSerializer().serializeToString(svgElement);
      const encoded = window.btoa(unescape(encodeURIComponent(svgMarkup)));
      tstOutput.style.backgroundImage = `url(data:image/svg+xml;base64,${encoded})`;
    }

    // read by the @media print rule in custom.scss via content: attr(data-watermark)
    tstOutput.setAttribute('data-watermark', ` - ${label}`.repeat(1000));
  };

  const setupPreventPaste = () => {
    const onBlockedAction = (event) => {
      event.preventDefault();
      swapToAlertFavicon();
    };

    tstOutput.addEventListener('paste', onBlockedAction);
    tstOutput.addEventListener('cut', onBlockedAction);
    tstOutput.addEventListener('copy', onBlockedAction);
    document.body.addEventListener('contextmenu', (event) => event.preventDefault());

    // rich-text answers render into iframes that do not exist yet at this point
    window.setTimeout(() => {
      Array.from(document.getElementsByTagName('iframe')).forEach((iframe) => {
        const doc = iframe.contentDocument;
        if (!doc) {
          return;
        }
        const style = doc.createElement('style');
        style.textContent = 'body { -webkit-touch-callout: none; -webkit-user-select: none; '
          + '-moz-user-select: none; -ms-user-select: none; user-select: none; }';
        doc.head.appendChild(style);
        doc.documentElement.addEventListener('contextmenu', onBlockedAction);
        doc.documentElement.addEventListener('paste', onBlockedAction);
        doc.documentElement.addEventListener('cut', onBlockedAction);
        doc.documentElement.addEventListener('copy', onBlockedAction);
      });
    }, 1500);
  };

  const setupPreventTextSelection = () => {
    const selectors = [
      '.ilc_page_title_PageTitle',
      '.ilc_qtitle_Title',
      '.answertext',
      '.ilc_qinput_TextInput',
      '.ilc_qanswer_Answer',
      '.ilAdditionalAssQuestionInstruction',
      '.ilc_question_Standard > .ilc_qtitle_Title',
    ];
    tstOutput.querySelectorAll(selectors.join(', ')).forEach((el) => {
      el.setAttribute('unselectable', 'on');
      el.addEventListener('selectstart', (event) => event.preventDefault());
      el.addEventListener('dragstart', (event) => event.preventDefault());
    });
  };

  if (tstOutput.classList.contains('tst-with-watermark')) {
    setupWatermark();
  }
  if (tstOutput.classList.contains('tst-with-prevent-paste')) {
    setupPreventPaste();
  }
  if (tstOutput.classList.contains('tst-with-prevent-txt-selection')) {
    setupPreventTextSelection();
  }
});
