document.addEventListener('DOMContentLoaded', function() {
  const proxyHostInput = document.getElementById('proxy-host');
  const proxyPortInput = document.getElementById('proxy-port');
  const enableProxyCheckbox = document.getElementById('enable-proxy');
  const updateProxyButton = document.getElementById('update-proxy');
  const proxyStatus = document.getElementById('proxy-status');
  const statusText = document.createElement('p');
  statusText.id = 'status-text';
  document.getElementById('proxy-settings').appendChild(statusText);

  // Load saved settings
  chrome.storage.sync.get(['proxyHost', 'proxyPort', 'proxyEnabled'], function(items) {
    if (items.proxyHost) {
      proxyHostInput.value = items.proxyHost;
    }
    if (items.proxyPort) {
      proxyPortInput.value = items.proxyPort;
    }
    if (items.proxyEnabled !== undefined) {
      enableProxyCheckbox.checked = items.proxyEnabled;
      updateProxyStatusText(items.proxyEnabled);
    }
  });

  // Update proxy status text
  enableProxyCheckbox.addEventListener('change', function() {
    updateProxyStatusText(enableProxyCheckbox.checked);
  });

  // Update proxy settings
  updateProxyButton.addEventListener('click', function() {
    const proxyHost = proxyHostInput.value.trim();
    const proxyPort = parseInt(proxyPortInput.value, 10);
    const proxyEnabled = enableProxyCheckbox.checked;

    if (!proxyHost || isNaN(proxyPort)) {
      statusText.textContent = 'Invalid host or port.';
      statusText.style.color = 'red';
      return;
    }

    // Save settings
    chrome.storage.sync.set({
      proxyHost: proxyHost,
      proxyPort: proxyPort,
      proxyEnabled: proxyEnabled
    }, function() {
      if (proxyEnabled) {
        chrome.proxy.settings.set(
          {
            value: {
              mode: "fixed_servers",
              rules: {
                singleProxy: {
                  scheme: "socks5",
                  host: proxyHost,
                  port: proxyPort
                },
                bypassList: ["localhost"]
              }
            },
            scope: 'regular'
          },
          function() {
            if (chrome.runtime.lastError) {
              statusText.textContent = `Error: ${chrome.runtime.lastError.message}`;
              statusText.style.color = 'red';
            } else {
              statusText.textContent = 'Proxy enabled';
              statusText.className = 'green';
            }
          }
        );
      } else {
        chrome.proxy.settings.clear(
          {
            scope: 'regular'
          },
          function() {
            if (chrome.runtime.lastError) {
              statusText.textContent = `Error: ${chrome.runtime.lastError.message}`;
              statusText.style.color = 'red';
            } else {
              statusText.textContent = 'Proxy disabled';
              statusText.className = 'red';
            }
          }
        );
      }
    });
  });

  function updateProxyStatusText(enabled) {
    if (enabled) {
      proxyStatus.textContent = 'Enabled';
      proxyStatus.className = 'green';
    } else {
      proxyStatus.textContent = 'Disabled';
      proxyStatus.className = 'red';
    }
  }
});
