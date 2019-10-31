const noise = {
    uniforms: {
        freq: { type: "f", value: 0.0},
        time: { type: "f", value: 0.0},
        speed: { type: "f", value: 50},
        opacity: { type: "f", value: 0.1},
        perlin: { type: "t", value: undefined },
    },
    wireframe: true,
    transparent: true,
    depthTest: false,
    vertexShader: `
      uniform sampler2D perlin;
      uniform float freq;
      uniform float time;
      uniform float speed;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec4 color = texture2D(perlin, uv); // get texture's UV coordinate
        vec4 color_shift = texture2D(perlin, vec2(color.r, color.b) + time * speed); // update color based on audio
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + color_shift.rgb, 1.0); // convert position
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D perlin;
      uniform float freq;
      uniform float time;
      uniform float speed;
      uniform float opacity;

      void main() {
        vec2 uv = vUv;
        vec4 color = texture2D(perlin, uv);
        gl_FragColor = vec4(vec3(color), opacity); 
      }
    `
}

export { noise }