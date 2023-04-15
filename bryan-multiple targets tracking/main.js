import {GLTFLoader} from '../libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js';
const THREE = window.MINDAR.IMAGE.THREE;
import {loadGLTF, loadAudio, loadVideo, loadTexture} from '../libs/loader.js';

// Execute JS after HTML contents have finished loading
document.addEventListener('DOMContentLoaded', () => {
    const start = async () => {
    
        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: document.body,
            imageTargetSrc: '../assets/targets/musicband.mind',
            maxTrack: 2 // The number of targets to track simultaneously
        }); 

        const {scene, camera, renderer} = mindarThree;
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);

        const raccoonAnchor = mindarThree.addAnchor(0);
        const raccoon = await loadGLTF('../assets/models/musicband-raccoon/scene.gltf');
        raccoon.scene.scale.set(0.1, 0.1, 0.1);
        raccoon.scene.position.set(0, -0.4, 0);
        raccoon.scene.userData.clickable = true;
        raccoonAnchor.group.add(raccoon.scene);

        const bearAnchor = mindarThree.addAnchor(1);
        const bear = await loadGLTF('../assets/models/musicband-bear/scene.gltf');
        bear.scene.scale.set(0.1, 0.1, 0.1);
        bear.scene.position.set(0, -0.4, 0);
        bearAnchor.group.add(bear.scene);

        // Add an image that will be displayed on the bear marker
        const cardImage = await loadTexture('../assets/targets/card.png');
        const cardMaterial = new THREE.SpriteMaterial({
            map: cardImage,
            color: 0xffffff
        });
        const cardSprite = new THREE.Sprite(cardMaterial);
        bearAnchor.group.add(cardSprite);
        // Set the scale and position of the card image
        cardSprite.scale.set(1, 0.5, 1);
        cardSprite.position.set(1, 0, 1);


        // Add music
        const audioClip = await loadAudio('../assets/sounds/musicband-background.mp3');
        const listener = new THREE.AudioListener();
        const audio = new THREE.PositionalAudio(listener);
        // Listener is like our ears, we want to position our ears to the camera.
        camera.add(listener);
        // Creates a spacial effect, making it sound closer.
        raccoonAnchor.group.add(audio);
        bearAnchor.group.add(audio);
        // Start deminishing the audio when it reaches certain points (try different values)
        audio.setRefDistance(100);
        audio.setBuffer(audioClip);
        audio.setLoop(true);


        // // Add Video
        // const video = await loadVideo('../assets/videos/sintel/sintel.mp4');
        // const texture = new THREE.VideoTexture(video);
        // // The width: 1 (same width as target image) height: 1 (square)
        // // However, our video is not a square, the video we're using has dimension: 480 * 204,
        // // so to keep the aspect ratio, height: 204/ 480
        // const geometry = new THREE.PlaneGeometry(1, 204/480);
        // const material = new THREE.MeshBasicMaterial({
        //     map: texture,
        //     side: THREE.DoubleSide
        // });
        // const plane = new THREE.Mesh(geometry, material);
        // raccoonAnchor.group.add(plane);


        // (3D MODEL ANIMATION) gltf.animations
        const mixer = new THREE.AnimationMixer(raccoon.scene);
        // A 3d model can contain multiple animations, we're selecting the 1st one.
        const action = mixer.clipAction(raccoon.animations[0]);
        action.play();

        const bearMixer = new THREE.AnimationMixer(bear.scene);
        const bearAction = bearMixer.clipAction(bear.animations[0]);
        bearAction.play();

        const clock = new THREE.Clock();

        // Event Handling
        bearAnchor.onTargetFound = () => {
            audio.play();
            bear.scene.userData.clickable = true;
        }

        bearAnchor.onTargetLost = () => {
            audio.pause();
            bear.scene.userData.clickable = false;
        }

        raccoonAnchor.onTargetFound = () => {
            // Play the audio when the raccoon target is found
            // video.play();
        }
        
        raccoonAnchor.onTargetLost = () => {
            // Pause the audio when the raccoon target is lost
            // video.pause();
        }


        // Detect Click Event
        document.body.addEventListener('click', e => {
            // Normalize the coordinates
            const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            const mouseY = -1 * ((e.clientY / window.innerHeight) * 2 - 1);
            const mouse = new THREE.Vector2(mouseX, mouseY);

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            // 1st Param: list of objects that we're interested in. We can put in raccoon.scene for simplicity.
            // But, the generic way is to check multiple objects simultaneously, which is "scene.children"
            // 2nd Param: Whether we should check recursively for all the descendents (boolean)
            // It returns the list of intersects.
            // The 3d model (raccoon) itself contains a hierarchy of some objects, just like anchor and scene in 3d world.
            const intersects = raycaster.intersectObjects(scene.children, true);
            if(intersects.length > 0) {        
                // The object 'o' could just be descendent of objects of the raccoon
                let o = intersects[0].object;
                console.log(o);
                console.log(raccoon.scene);
                while(o.parent && !o.userData.clickable) {
                    o = o.parent;
                }
                if(o.userData.clickable) {
                    if(o === raccoon.scene) {
                        console.log('racoon clicked');
                        // audio.play();
                    }
                }

            }    
        });

        await mindarThree.start();
        // The callback function will be executed for every frame
        renderer.setAnimationLoop(() => {
            // Get the elapsed time since last frame
            const delta = clock.getDelta();

            // Update the included animation from the gltf model
            mixer.update(delta);
            bearMixer.update(delta);

            // Animating the rotation
            raccoon.scene.rotation.set(0, raccoon.scene.rotation.y + delta, 0);
            bear.scene.rotation.set(0, bear.scene.rotation.y + delta, 0);


            renderer.render(scene, camera);
        });
    };
    start();
});
