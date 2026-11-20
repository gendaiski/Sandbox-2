
    import * as THREE from 'three';
    const canvas = document.getElementById('orb-hero');
    const stage = document.getElementById('orb-stage');
    const w = stage.clientWidth, h = stage.clientHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3;

    const vs = `
      uniform float uTime; varying vec3 vN, vP;
      vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
      vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
      vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
      float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g,l.zxy);vec3 i2=max(g,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
      void main(){vN=normal;vP=position;float n=snoise(position*1.8+uTime*0.3);vec3 np=position+normal*n*0.08;gl_Position=projectionMatrix*modelViewMatrix*vec4(np,1.);}
    `;
    const fs = `
      uniform float uTime; uniform vec2 uMouse; varying vec3 vN, vP;
      void main(){
        vec3 vd=normalize(cameraPosition-vP); float fr=pow(1.-max(dot(vd,vN),0.),2.);
        float t=(vP.y+1.)*.5; vec3 c1=vec3(.29,.62,.75); vec3 c2=vec3(.42,.31,.63);
        vec3 base=mix(c1,c2,t+uMouse.x*0.2);
        float iri=fr*0.2; vec3 ic=vec3(sin(vP.y*4.+uTime*.6)*iri,sin(vP.y*4.+uTime*.6+2.094)*iri,sin(vP.y*4.+uTime*.6+4.189)*iri);
        vec3 glow=vec3(.56,.89,1.)*fr*0.3;
        gl_FragColor=vec4(base+glow+ic,0.92);
      }
    `;
    const u = { uTime:{value:0}, uMouse:{value:new THREE.Vector2(0,0)} };
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.8,96,96), new THREE.ShaderMaterial({vertexShader:vs,fragmentShader:fs,uniforms:u,transparent:true}));
    scene.add(mesh);
    let mx=0, my=0;
    stage.addEventListener('mousemove', e => {
      const r=stage.getBoundingClientRect();
      mx=((e.clientX-r.left)/r.width-0.5)*2;
      my=((e.clientY-r.top)/r.height-0.5)*2;
    });
    const ck = new THREE.Clock();
    (function animate(){
      requestAnimationFrame(animate);
      const t=ck.getElapsedTime();
      u.uTime.value=t;
      u.uMouse.value.x+=(mx-u.uMouse.value.x)*0.05;
      u.uMouse.value.y+=(my-u.uMouse.value.y)*0.05;
      mesh.rotation.y=t*0.08+u.uMouse.value.x*0.3;
      mesh.rotation.x=u.uMouse.value.y*0.2;
      const s=1+Math.sin(t*0.6)*0.02;
      mesh.scale.set(s,s,s);
      renderer.render(scene,camera);
    })();

    // Scroll fade
    const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')});},{threshold:0.12});
    document.querySelectorAll('.fade-in').forEach(el=>obs.observe(el));
  