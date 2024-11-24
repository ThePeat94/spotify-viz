self.onmessage = (e) => {
    console.log("helloooooo " + e.data.message);
    postMessage(e.data.currentState + 1);
}
