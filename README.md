# ＮＥＯＮＯＲＩＧＡＭＩ

An open-source virtual world platform for the future.

# How do I connect to the virtual web?

## Requirements

A supported device:
* Oculus Quest 1 or 2 using Firefox Reality Browser or Oculus Browser

## Setup

* Use the public access point [Neon Origami](http://neonorigami.com)

* Setup your own access point by creating an `index.html`

```html
<html>
    <head>
        <meta charset="utf-8">
        <script src="https://unpkg.com/neonorigami/neonorigami.js"></script>
    </head>
    <body>
        <neon-origami fullscreen></neon-origami>
    </body>
</html>
```

# How can I use Neon Origami components in A-Frame?

```html
<html>
  <head>
    <script src="https://aframe.io/releases/latest/aframe.min.js"></script>
    <script src="https://unpkg.com/neonorigami/aframe-neonorigami.js"></script>
  </head>
  <body>
    <a-scene background="color: #FAFAFA">
      <a-entity position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9" shadow></a-box>
      <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E" shadow></a-sphere>
      <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D" shadow></a-cylinder>
      <a-entity position="-1 0.5 -3" neon-origami-landscape shadow></a-entity>
    </a-scene>
  </body>
</html>
```
