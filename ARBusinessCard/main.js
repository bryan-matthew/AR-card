import { loadGLTF, loadVideo, loadTextures, loadTexture, loadAudio } from "../libs/loader.js";
import { CSS3DObject } from "../libs/three.js-r132/examples/jsm/renderers/CSS3DRenderer.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
    const start = async () => {
        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: document.body,
            imageTargetSrc: '../assets/targets/card.mind'
        });

        const {renderer, cssRenderer, scene, cssScene, camera} = mindarThree;
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);

        const cardAnchor = mindarThree.addAnchor(0);
        

        // Animals model
        const animals = await loadGLTF('../assets/animals/scene.gltf');
        animals.scene.scale.set(0.3, 0.3, 0.3);
        animals.scene.position.set(-1, -0.1, 0.5);
        cardAnchor.group.add(animals.scene);

        // Animation
        const mixer = new THREE.AnimationMixer(animals.scene);
        const action = mixer.clipAction(animals.animations[0]);
        action.play();

        // Buttons
        const [
            profileTexture,
            emailTexture,
            phoneTexture,
            locationTexture
        ] = await loadTextures([
            '../assets/portfolio/icons/profile.png',
            '../assets/portfolio/icons/email.png',
            '../assets/portfolio/icons/phone.png',
            '../assets/portfolio/icons/location.png'
        ]);

        const iconGeometry = new THREE.CircleGeometry(0.05, 32);

        const profileMaterial = new THREE.MeshBasicMaterial({map: profileTexture});  
        const emailMaterial = new THREE.MeshBasicMaterial({map: emailTexture});  
        const phoneMaterial = new THREE.MeshBasicMaterial({map: phoneTexture});  
        const locationMaterial = new THREE.MeshBasicMaterial({map: locationTexture});  

        // The 3D Models (Meshes)
        const profileIcon = new THREE.Mesh(iconGeometry, profileMaterial);
        const emailIcon = new THREE.Mesh(iconGeometry, emailMaterial);
        const phoneIcon = new THREE.Mesh(iconGeometry, phoneMaterial);
        const locationIcon = new THREE.Mesh(iconGeometry, locationMaterial);

        // Positioning the icons
        profileIcon.position.set(0.59, 0.2, 0);
        emailIcon.position.set(0.59, 0.065, 0);
        phoneIcon.position.set(0.59, -0.065, 0);
        locationIcon.position.set(0.59, -0.2, 0);

        // Add them to the anchor (Three.GROUP)
        cardAnchor.group.add(profileIcon);
        cardAnchor.group.add(emailIcon);
        cardAnchor.group.add(phoneIcon);
        cardAnchor.group.add(locationIcon);

        // If the buttons are clicked, show a section
        

        // Load Audio
        const audioClip = await loadAudio('../assets/sounds/musicband-background.mp3');
        const listener = new THREE.AudioListener();
        camera.add(listener);
        const audio = new THREE.PositionalAudio(listener);
        cardAnchor.group.add(audio);

        audio.setBuffer(audioClip);
        audio.setRefDistance(100);
        audio.setLoop(true);

        cardAnchor.onTargetFound = () => {
            audio.play();
        }

        cardAnchor.onTargetLost = () => {
            audio.pause();
        }


        const clock = new THREE.Clock();

        await mindarThree.start();
        renderer.setAnimationLoop(() => {   
            const delta = clock.getDelta();

            mixer.update(delta);
            animals.scene.rotation.set(Math.PI / 2, 0, 0);
            renderer.render(scene, camera);
            // cssRenderer.render(cssScene, camera);
        });
    }
    start();
});
