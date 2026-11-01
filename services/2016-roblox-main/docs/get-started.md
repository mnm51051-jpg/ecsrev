# Quick Start

1. If you don't already have it, install an LTS version of node

    - For Windows, you can download the installer at [nodejs.org](https://nodejs.org/en/) and then run it.
    - For Linux, I recommend using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating).


2. Open a terminal

3. Start the local .NET website/API from the repository root instructions and confirm it is reachable at [localhost:5000](http://localhost:5000). The generated frontend config uses this first-party API by default. If you use another backend, edit `config.json` to an API origin you control before building.

4. Run `npm ci` to install the locked dependencies.

5. Choose a run mode:

    **Release:** Run `npm run build`, then `npm run start`

    **Debug/Dev:** Run `npm run dev`

The frontend automatically creates an ignored `config.json` before development and production builds. Sign-in is for Economy Simulator accounts only; never enter a Roblox password or paste a Roblox session cookie into this site.

6. Visit [localhost:3000](http://localhost:3000) in your browser. Account, catalog, and game features require the local backend and its configured services to be running.

---

### Q&A

**How do I change the port?**

Either set the "PORT" environmental variable to the port number you want to use, or run `next dev -p 1000` or `next start -p 1000` (replacing 1000 with the port you want to use). More info is available here: [stackoverflow.com/questions/60147499/how-to-set-port-in-next-js](https://stackoverflow.com/questions/60147499/how-to-set-port-in-next-js)

