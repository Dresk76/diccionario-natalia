// Script para generar los íconos PWA
// Ejecutar con: node generate-icons.js
import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fondo
  ctx.fillStyle = '#2d1a0e';
  ctx.fillRect(0, 0, size, size);

  // Línea dorada superior
  ctx.fillStyle = '#c8963e';
  ctx.fillRect(0, 0, size, size * 0.04);

  // Letra N centrada
  ctx.fillStyle = '#fdf6ee';
  ctx.font = `${size * 0.55}px Georgia`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', size / 2, size / 2 + size * 0.03);

  // Punto dorado decorativo
  ctx.fillStyle = '#c8963e';
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.82, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  writeFileSync(filename, canvas.toBuffer('image/png'));
  console.log(`Generated ${filename}`);
}

generateIcon(192, 'public/icon-192.png');
generateIcon(512, 'public/icon-512.png');
