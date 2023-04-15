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

        // Load Images (Textures)
        const [
            cardTexture,
            emailTexture,
            locationTexture,
            webTexture,
            profileTexture,
            leftTexture,
            rightTexture,
            portfolioItem0Texture,
            portfolioItem1Texture,
            portfolioItem2Texture] 
            = await loadTextures([
                '../assets/targets/card.png',
                '../assets/portfolio/icons/email.png',
                '../assets/portfolio/icons/location.png',
                '../assets/portfolio/icons/web.png',
                '../assets/portfolio/icons/profile.png',
                '../assets/portfolio/icons/left.png',
                '../assets/portfolio/icons/right.png',
                '../../assets/portfolio/portfolio/paintandquest-preview.png',
                '../../assets/portfolio/portfolio/coffeemachine-preview.png',
                '../../assets/portfolio/portfolio/peak-preview.png',
            ]);
        
        // Create the 3d Card Object
        const planeGeometry = new THREE.PlaneGeometry(1, 0.552);
        const cardMaterial = new THREE.MeshBasicMaterial({
            map: cardTexture
        });
        const card = new THREE.Mesh(planeGeometry, cardMaterial);

        // Create the other 3d Objects
        const iconGeometry  = new THREE.CircleGeometry(0.075, 32);
        const emailMaterial = new THREE.MeshBasicMaterial({map: emailTexture, side: THREE.DoubleSide});
        const locationMaterial = new THREE.MeshBasicMaterial({map: locationTexture, side: THREE.DoubleSide});
        const webMaterial = new THREE.MeshBasicMaterial({map: webTexture, side: THREE.DoubleSide});
        const profileMaterial = new THREE.MeshBasicMaterial({map: profileTexture, side: THREE.DoubleSide});
        const leftMaterial = new THREE.MeshBasicMaterial({map: leftTexture});
        const rightMaterial = new THREE.MeshBasicMaterial({map: rightTexture});
        
        // The meshes (3D Objects) of the ICONS
        const emailIcon = new THREE.Mesh(iconGeometry, emailMaterial);
        const locationIcon = new THREE.Mesh(iconGeometry, locationMaterial);
        const webIcon = new THREE.Mesh(iconGeometry, webMaterial);
        const profileIcon = new THREE.Mesh(iconGeometry, profileMaterial);
        const leftIcon = new THREE.Mesh(iconGeometry, leftMaterial);
        const rightIcon = new THREE.Mesh(iconGeometry, rightMaterial);

        const portfolioItem0Video = await loadVideo('../assets/portfolio/portfolio/paintandquest.mp4');
        portfolioItem0Video.muted = true;
        const portfolioItem0VideoTexture = new THREE.VideoTexture(portfolioItem0Video);

        // The Materials for the 3D Objects 
        const portfolioItem0VideoMaterial = new THREE.MeshBasicMaterial({map: portfolioItem0VideoTexture});
        const portfolioItem0Material = new THREE.MeshBasicMaterial({map: portfolioItem0Texture});
        const portfolioItem1Material = new THREE.MeshBasicMaterial({map: portfolioItem1Texture});
        const portfolioItem2Material = new THREE.MeshBasicMaterial({map: portfolioItem2Texture});

        // The Meshes (3D Objects) of the PORTFOLIO
        const portfolioItem0V = new THREE.Mesh(planeGeometry, portfolioItem0VideoMaterial);
        const portfolioItem0 = new THREE.Mesh(planeGeometry, portfolioItem0Material);
        const portfolioItem1 = new THREE.Mesh(planeGeometry, portfolioItem1Material);
        const portfolioItem2 = new THREE.Mesh(planeGeometry, portfolioItem2Material);

        // POSITIONING THE ICONS
        profileIcon.position.set(-0.42, -0.5, 0);
        webIcon.position.set(-0.14, -0.5, 0);
        emailIcon.position.set(0.14, -0.5, 0);
        locationIcon.position.set(0.42, -0.5, 0);

        // GROUPING THE PORTFOLIO-SPECIFIC ITEMS
        const portfolioGroup = new THREE.Group();
        portfolioGroup.position.set(0, 0.6, 0.3);
        portfolioGroup.rotation.set(Math.PI/2, 0, 0);
        
        portfolioGroup.add(portfolioItem0);
        portfolioGroup.add(leftIcon);
        portfolioGroup.add(rightIcon);

        leftIcon.position.set(-0.7, 0, 0);
        rightIcon.position.set(0.7, 0, 0);
      
        // Loading the SoftMind 3D Logo
        const avatar = await loadGLTF('../assets/models/softmind/scene.gltf');
        avatar.scene.scale.set(0.004, 0.004, 0.004);
        avatar.scene.position.set(0, -0.25, -0.3);

        // Adding all the elements (objects) to the anchor
        cardAnchor.group.add(avatar.scene); // SoftMind 3D Logo
        cardAnchor.group.add(card); // SoftMind 2D logo
        cardAnchor.group.add(emailIcon);
        cardAnchor.group.add(webIcon);
        cardAnchor.group.add(profileIcon);
        cardAnchor.group.add(locationIcon);
        cardAnchor.group.add(portfolioGroup);

        // Make a 3D CSS Element
        const textElement = document.createElement('div');
        const textObj = new CSS3DObject(textElement);
        // In MindAR, 1000px = 1 unit 
        textObj.position.set(0, -750, 0);
        textObj.visible = false;
        // Styling the HTML Element
        textElement.style.opacity = 0.6;
        textElement.style.color = '#FFFFFF';
        textElement.style.background = '#000000';
        textElement.style.padding = '30px';
        textElement.style.fontSize = '60px';

        // Adding the text object to the CSS anchor
        const cssAnchor = mindarThree.addCSSAnchor(0);
        cssAnchor.group.add(textObj);

        // Handle all the buttons
        emailIcon.userData.clickable = true;
        profileIcon.userData.clickable = true;
        webIcon.userData.clickable = true;
        locationIcon.userData.clickable = true;
        portfolioItem0.userData.clickable = true;
        portfolioItem0V.userData.clickable = true;
        leftIcon.userData.clickable = true;
        rightIcon.userData.clickable = true;

        // Portfolio Items (3D Objects)
        const portfolioItems = [portfolioItem0, portfolioItem1, portfolioItem2];
        let currentPortfolio = 0;

        document.body.addEventListener('click', (e) => {
            const mouseX = (e.clientX/ window.innerWidth) * 2 - 1;
            const mouseY = -(e.clientY/ window.innerHeight) * 2 + 1;
            const mouse = new THREE.Vector2(mouseX, mouseY);

            // Setting up the raycaster tp detect clicked object
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            if(intersects.length > 0) {
                // The current intersected (clicked) object
                let o = intersects[0].object;
                // While the parent object != null and it's not clickable
                while(o.parent && !o.userData.clickable) {
                    o = o.parent; // Going up to the parent
                }
                // Check if clickable
                // We've set all our objects to be clickable, so it's going to be one of them
                if(o.userData.clickable) {
                    if(o === leftIcon || o === rightIcon) {
                        // Left icon is clicked
                        if(o === leftIcon) {
                            console.log('left button is clicked');
                            // Get the index of the currently viewed portfolio
                            currentPortfolio = (currentPortfolio - 1 + portfolioItems.length) % portfolioItems.length;
                        }
                        // Right icon is clicked
                        else {
                            console.log('right button is clicked');
                            // Get the index of the currently viewed portfolio
                            currentPortfolio = (currentPortfolio + 1) % portfolioItems.length;
                        }
                        // Pause the video on each turn 
                        portfolioItem0Video.pause();
                        // Loop thru the portfolioItems array and remove everything (Basically remove them from the 3D environment)
                        for(let i = 0; i < portfolioItems.length; i++) {
                            portfolioGroup.remove(portfolioItems[i]);
                        }
                        // Only show the current Portfolio
                        portfolioGroup.add(portfolioItems[currentPortfolio]);
                    }
                    // If we tap on the video thumbnail
                    else if(o === portfolioItem0) {
                        // Remove the image (thumbnail)
                        portfolioGroup.remove(portfolioItem0);
                        // Replace it with the video
                        portfolioGroup.add(portfolioItem0V);
                        portfolioItems[0] = portfolioItem0V;
                        // Play the video
                        portfolioItem0Video.play();
                    }
                    // If we tap on the video 
                    else if(o === portfolioItem0V) {
                        // If it's paused, play the video
                        if(portfolioItem0Video.paused) {
                            portfolioItem0Video.play();
                        }
                        // If it's played, pause the video
                        else {
                            portfolioItem0Video.pause();
                        }
                    }
                    // If we tap on the 'WEBSITE' icon
                    else if(o === webIcon) {
                        textObj.visible = true;
                        textElement.innerHTML = "<a href='https://github.com/bryan-matthew/'>Website</a>";
                    }
                    // If we tap on the 'EMAIL' icon
                    else if(o === emailIcon) {
                        textObj.visible = true;
                        textElement.innerHTML = "<a href='https://bmatth21@gmail.com/'>Email</a>";

                    }
                    // If we tap on the 'PROFILE' icon
                    else if(o === profileIcon) {
                        textObj.visible = true;
                        textElement.innerHTML = 'Bryan Matthew';
                    }
                    // If we tap on the 'LOCATION' icon
                    else if(o === locationIcon) {
                        textObj.visible = true;
                        textElement.innerHTML = 'Phoenix, Arizona, USA';
                    }
                }
            }
        });

        const clock = new THREE.Clock();

        await mindarThree.start();
        renderer.setAnimationLoop(() => {
            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();
            const iconScale = 1 + 0.2 * Math.sin(elapsed * 5);

            [webIcon, emailIcon, locationIcon, profileIcon].forEach(icon => {
                icon.scale.set(iconScale, iconScale, iconScale);
            });

            const avatarZ = Math.min(0.3, -0.3 + elapsed * 0.5);
            avatar.scene.position.set(0, -0.25, avatarZ);

            renderer.render(scene, camera);
            cssRenderer.render(cssScene, camera);
        });
    }
    start();
});
