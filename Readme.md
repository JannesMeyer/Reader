Autoren
=======

- Florian Uhlig
- Jannes Meyer
- Magdalena Riecken


Repository setup
================

git config core.autocrlf false


Installation
============

1. [node.js](http://nodejs.org/) installieren
2. Abhängigkeiten mit dem Node Package Manager installieren:

    `npm install -d`

3. Server starten:

    `node app.js`

4. Seite laden:

    http://localhost:3000/



Server automatisch neustarten
=============================

1. Node-Supervisor installieren

    `npm install -g supervisor`

2. Server starten:

    `supervisor -w routes,app.js app.js`