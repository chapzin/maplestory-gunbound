/**
 * Funções matemáticas úteis para o jogo
 */

/**
 * Converte graus para radianos
 * @param degrees Ângulo em graus
 * @returns Ângulo em radianos
 */
export const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Converte radianos para graus
 * @param radians Ângulo em radianos
 * @returns Ângulo em graus
 */
export const radiansToDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

/**
 * Limita um valor entre um mínimo e um máximo
 * @param value Valor a ser limitado
 * @param min Valor mínimo
 * @param max Valor máximo
 * @returns Valor limitado
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Calcula a distância entre dois pontos
 * @param x1 Coordenada X do primeiro ponto
 * @param y1 Coordenada Y do primeiro ponto
 * @param x2 Coordenada X do segundo ponto
 * @param y2 Coordenada Y do segundo ponto
 * @returns Distância entre os pontos
 */
export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Retorna um número aleatório entre min e max (inclusive)
 * @param min Valor mínimo
 * @param max Valor máximo
 * @returns Número aleatório
 */
export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Retorna um número inteiro aleatório entre min e max (inclusive)
 * @param min Valor mínimo
 * @param max Valor máximo
 * @returns Número inteiro aleatório
 */
export const randomIntBetween = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Verifica se dois retângulos se interceptam
 * @param r1x Coordenada X do primeiro retângulo
 * @param r1y Coordenada Y do primeiro retângulo
 * @param r1w Largura do primeiro retângulo
 * @param r1h Altura do primeiro retângulo
 * @param r2x Coordenada X do segundo retângulo
 * @param r2y Coordenada Y do segundo retângulo
 * @param r2w Largura do segundo retângulo
 * @param r2h Altura do segundo retângulo
 * @returns Verdadeiro se os retângulos se interceptarem
 */
export const rectanglesIntersect = (
  r1x: number, r1y: number, r1w: number, r1h: number,
  r2x: number, r2y: number, r2w: number, r2h: number
): boolean => {
  return !(
    r1x + r1w < r2x ||
    r2x + r2w < r1x ||
    r1y + r1h < r2y ||
    r2y + r2h < r1y
  );
};

/**
 * Calcula a trajetória de um projétil
 * @param startX Posição inicial X
 * @param startY Posição inicial Y
 * @param angle Ângulo em graus
 * @param power Potência do tiro
 * @param gravity Gravidade
 * @param wind Vento (positivo = direita, negativo = esquerda)
 * @param timeStep Passo de tempo
 * @param maxSteps Número máximo de passos
 * @returns Array de pontos representando a trajetória
 */
export const calculateProjectileTrajectory = (
  startX: number, 
  startY: number, 
  angle: number, 
  power: number, 
  gravity: number,
  wind: number,
  timeStep: number = 0.1,
  maxSteps: number = 1000
): Array<{x: number, y: number}> => {
  const radians = degreesToRadians(angle);
  let velocityX = Math.cos(radians) * power;
  let velocityY = -Math.sin(radians) * power; // Negativo porque Y cresce para baixo
  
  const trajectory: Array<{x: number, y: number}> = [{x: startX, y: startY}];
  
  let x = startX;
  let y = startY;
  let time = 0;
  
  for (let i = 0; i < maxSteps; i++) {
    time += timeStep;
    
    // Atualiza a velocidade considerando gravidade e vento
    velocityY += gravity * timeStep;
    velocityX += wind * timeStep * 0.05; // O fator 0.05 ajusta o efeito do vento
    
    // Atualiza a posição
    x += velocityX * timeStep;
    y += velocityY * timeStep;
    
    trajectory.push({x, y});
    
    // Condição de parada (poderia ser contato com o terreno)
    if (y > 1000) { // Valor arbitrário, na prática seria a colisão com o terreno
      break;
    }
  }
  
  return trajectory;
}; 