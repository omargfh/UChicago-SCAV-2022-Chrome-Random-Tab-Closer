let lifeline;

keepAlive();

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'keepAlive') {
    lifeline = port;
    setTimeout(keepAliveForced, 295e3); // 5 minutes minus 5 seconds
    port.onDisconnect.addListener(keepAliveForced);
  }
});

function keepAliveForced() {
  lifeline?.disconnect();
  lifeline = null;
  keepAlive();
}

async function keepAlive() {
  if (lifeline) return;
  for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => chrome.runtime.connect({ name: 'keepAlive' }),
        // `function` will become `func` in Chrome 93+
      });
      chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
      return;
    } catch (e) {}
  }
  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(tabId, info, tab) {
  if (info.url && /^(file|https?):/.test(info.url)) {
    keepAlive();
  }
}

const fn = () => {
  chrome.windows.getCurrent(w => {
    chrome.tabs.query({windowId: w.id}, tabs => {
      let len = tabs.length;
        console.log(tabs.length);
        let random_tab = tabs[Math.floor(Math.random()*len)];
        chrome.tabs.remove(random_tab.id);
        console.log("Tab closed.");
      });
    });
    scheduleClose();
    keepAliveForced();
}

const scheduleClose = () => {
    let time = (Math.random() * 2) * 60000;
    console.log(`Time until random tab closes is ${(time / 60000).toFixed(2)} minutes.`);
    setTimeout(() => {
      fn();
    }, time);
}

chrome.runtime.onInstalled.addListener(scheduleClose);
chrome.windows.onCreated.addListener(scheduleClose);