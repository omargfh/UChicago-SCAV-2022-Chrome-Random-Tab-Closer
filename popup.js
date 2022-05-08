const fn = () => {
    chrome.tabs.query({
        currentWindow: true
    }, function (tabs) {
        let len = tabs.length;
        if (tabs.length !== 0) {
            let random_tab = tabs[Math.floor(Math.random()*len)];
            chrome.tabs.remove(random_tab.id);
            console.log("Tab closed.");
        }
    });
}

const schedule_fn = (time) => {
    setTimeout(() => {
        fn();
    }, time);
}

document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById("closeRandomTabBtn");
    link.addEventListener('click', () => {
        fn();
    });
});