define([], function () {
  var master;
  var panel;
  var content;
  var close;
  var email;
  var installbutton;
  var viewbutton;
  var installlink;
  var mailButton;
  var mailNotice;
  var mailError;
  var mailLink;

  var instsallQRCode;

  function findImportantDOMElements () {
    master = document.getElementById('publish-pane');
    panel = document.getElementById('publish-pane-panel');
    content = document.getElementById('publish-pane-panel-content');
    close = document.getElementById('close-publish-pane-panel');
    email = document.getElementById('publish-pane-panel-email');
    installbutton = document.getElementById('install-button');
    viewbutton = document.getElementById('view-button');
    installlink = document.getElementById('install-link');
    mailButton = document.querySelector('#publish-pane-button');
    mailNotice = document.querySelector('.mail-notice');
    mailError = document.querySelector('.mail-error');
    mailLink = document.querySelector('.mail-link');
    instsallQRCode = document.querySelector('.qrcode[data-qrcode-for="install"]');

    close.addEventListener("click", closePublishPanel);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    findImportantDOMElements();
  }
  else {
    window.addEventListener('polymer-ready', findImportantDOMElements);
  }

  function showQRCode (kind) {
    var qrCodeTaggedElements = document.querySelectorAll('[data-qrcode-for]');

    Array.prototype.forEach.call(qrCodeTaggedElements, function (qrCode) {
      if (qrCode.getAttribute('data-qrcode-for') === kind) {
        qrCode.classList.add('on');
      }
      else {
        qrCode.classList.remove('on');
      }
    });
  }

  function closePublishPanel (e) {
    panel.classList.remove('expanded');
    content.classList.add('hidden');
    master.classList.add('hidden');
  }

  function hideEmailInput() {
    mailButton.disabled = true;
    email.disabled = true;
    mailLink.classList.add('faded');
  }

  function showEmailInput() {
    mailButton.disabled = false;
    email.disabled = false;
    mailLink.classList.remove('faded');
  }

  function onError() {
    mailError.classList.add('toggled');
    showEmailInput();
  }

  return {
    show: function(name, data) {
      var qrCodeLinks = document.querySelectorAll('a[data-qrcode-for]');

      Array.prototype.forEach.call(qrCodeLinks, function (a) {
        a.onclick = function (e) {
          showQRCode(a.getAttribute('data-qrcode-for'));
        };
      });

      showQRCode('install');

      master.classList.remove('hidden');
      showEmailInput();
      setTimeout(function() {
        panel.classList.add('expanded');
        content.classList.remove('hidden');
        mailButton.disabled = false;
        email.disabled = false;
        mailButton.classList.remove('fadeout');
        email.classList.remove('fadeout');
        email.value = '';
        installbutton.setAttribute('href', data.install);
        installlink.textContent = data.install;
        installlink.setAttribute('href', data.install);
        viewbutton.setAttribute('href', data.app);
        instsallQRCode.innerHTML = '';
        new QRCode(instsallQRCode, data.install);
        mailNotice.classList.remove("toggled");
        mailError.classList.remove('toggled');

        (function() {
          var mailButton = document.querySelector('#publish-pane-button');
          mailButton.onclick = function (e) {
            var address = email.value.trim();

            // If the address is blank, use the address specified by webmaker auth.
            // See user-state.html for more.
            if (address.length === 0) {
              address = email.getAttribute('placeholder');
            }

            hideEmailInput();
            mailError.classList.remove('toggled');

            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'notify?appURL=' + encodeURIComponent(data.install) + '&email=' + address, true);
            xhr.onerror = function (e) {
              console.error(e);
              onError();
            };
            xhr.onreadystatechange = function (e) {
              if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                  mailNotice.classList.add('toggled');
                }
                else {
                  console.error(e);
                  onError();
                }
              }
            };
            xhr.send(null);
          };
        }());
      }, 50);
    }
  };
});

