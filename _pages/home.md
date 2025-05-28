---
layout: splash
title: Tejaswa Rizyal
permalink: /
redirect_from:
  - /portfolio/
header:
    overlay_color: "#3b9cba"
    overlay_filter: "0.3"
excerpt: >
      Seems to me that you have landed on this <i>website</i>.
---

# About Me
<br>
Hiya! Nice to see you here!

I am Tej. I am currently in my my final year of MEng BSc Computer Science with High Performance Graphics and Games Engineering. I have an interest in High Performance C/C++ Programming and Modern Graphics and rendering systems. I also am interested in computer arithmetics, especially floating point accuracies and inconsistencies.


<br><br><br>
# Projects


{: .text-right}

## Axiom Swerve, a vehicular bullet hell game

<div class="align-left img-small">
<video controls autoplay muted loop style="max-width: 100%; height: auto;">
    <source src="/assets/videos/axiom_swerve.mp4" type="video/mp4" >
</video>
</div>

I made a game with a friend using our own game engine. We wanted to have a very stylised and stumulating experience that has no wait time. Axiom swerve came to be with powerups that initiate screen space effects and different drum and bass sound effects with every action you can take. The idea was to make every moment of the game fun, keeping the player interested in not only the objectives but also the in visual effects.

I was very inspired my the cyberpunk aesthetic and bullet hells that make every moment worth while.

<br style="clear: both;">

## Ubiquitous Reality, a game engine for style.

<div class="align-right img-small">
<video controls autoplay muted loop style="max-width: 100%; height: auto;">
    <source src="/assets/videos/ubqr.mp4" type="video/mp4" >
</video>
</div>

I started with the idea of complex rendering effects and object specific rendering, and wanted to make a game engine that allows me to use effects with gameplay seemlessly. After a couple conversations, a random word-generator, and a simple vulkan renderer later, I started this project with a small group aiming to get a simple racing game loop possible as test.

We then went on to create our own ECS from scratch, our own Vulkan loader and pipeline creator and our own event system. I took ownership of the renderer as I have developed a good skillset with Vulkan and I had ideas to improve the pipelines and also add special effects.

The poster goes into a lot of details but a video should be up very soon.


<br style="clear: both;">

{: .text-right}

## Raytracer with Optical Physics

<!-- ![image1](/assets/images/raytracer.png){: .align-left .img-small} -->
<div id="slider">
  <div class="image-container align-left img-small">
    <img src="{{ '/assets/images/raytracer.png' | relative_url }}" class="active" alt="Image 1">
    <img src="{{ '/assets/images/fresnelrefraction.png' | relative_url }}" alt="Image 2">
    <img src="{{ '/assets/images/shadows.png' | relative_url }}" alt="Image 3">

    <button class="nav-button left" onclick="prevImage()">❮</button>
    <button class="nav-button right" onclick="nextImage()">❯</button>
  </div>
</div>

This project involved making a raytracer to implement different optical effects such as reflectiona and shadows.
I started off with first making the OpenGL rendering half of the window, which simply renders a given obj file with material properties provided. This implemnets simple blinn phong without shadows or reflections etc.

The next step invloved implementing primary rays, intersection testing, and material color representation. Further implementing Blinn-Phong on the CPU and then implemened the shadow calculation logic.
Then implementing reflections as you can see in the image, using recursions of rays. Then I went on to implement refraction using Snell's Law and Fresnal Equations (Schlick's Approximation).

<br style="clear: both;">

## Vulkan Renderer

<!-- ![image2](/assets/images/deferred.png){: .align-right .img-small} -->

<div class="align-right img-small">
<video muted playinline autoplay loop style="max-width: 100%; height: auto;">
    <source src="/assets/videos/vulkan.mp4" type="video/mp4">
</video>
</div>

This project was my first major project in Vulkan, incorporating different rendering techniques that I can toggle. First I implemented simple forward shading with alpha masking, where the material properties as descriptor sets to calculate BRDF lighting in the shaders.
Secondly, I implemented a second pipeline and renderpass to implement render-to-texture and post processing pixellation/mosaic effect. This task help me understand renderpasses and rendering to images which I used in the next rendering technique: Deferred Shading.
Implemening deferred shading involved creating G-Buffer where I output the normals, albedo texture, depth and emissive texture images and include the other materials in the alpha values of these images to reduce bandwidth costs. In a second render pass, I calculate fragment positions
using pixel positions and depth value and implement the BRDF shading with multiple light sources. This is the render that is shown in the image with the inverse square light falloff also implemented.


<br style="clear: both;">

{: .text-right}

## Animation and Collision Physics

<div class="align-left img-small">
<video controls autoplay muted loop style="max-width: 100%; height: auto;">
    <source src="/assets/videos/animation_collision.mp4" type="video/mp4">
</video>
</div>

A project implementing animation across different surfaces and collision physics. This had two main parts, first being the rendering of the skeletal charactor and applying rotation based animations per frame to run. To improve the sudden stopping and running
I implemented interpolation to blend poses to start running slowly to look realistic and same with stopping.

The second part was to implement a simple collision systems for the balls/dodecahedrons. This involved collision testing with the character and the land surface and calculating impulse and direction to bounce the balls. For dodecahedrons I also implemented
angular velocity calculations to have realistic bounces.

<br style="clear: both;">

{: .text-left}

## Mesh Pocessing and Repair

<div class="align-right img-small">
<video controls autoplay muted loop style="max-width: 100%; height: auto;">
    <source src="/assets/videos/hamishslow.mp4" type="video/mp4">
</video>
</div>

A project involving mesh processing where I implemented several different command line tools, including, triangle soup parser to convert to indexed face and further to directed edge. Manifold testing for meshes, testing for pinch points and intersections. Mesh repair and simplification as well.



<br style="clear: both;">

{: .text-right}

## Bézier Curve Calculator and Visualiser

<div class="align-left img-small">
<video controls autoplay muted loop style="max-width: 100%; height: auto + 10px; padding-bottom: 10px">
    <source src="/assets/videos/bezier.mp4" type="video/mp4">
</video>
</div>

A Bézier curve visualiser developed from scratch where I started off with a function to set the colour of one pixel. Using that I created line drawing algorithms and drew the axes and axial planes. Using rotation matrices I also apply transformations to the axes and planes. The matrices are calculated depending on orthographic or perspective projection.

Next I created the control net using the control points of the bezier curve that start at the predefined positions. I also implemented a simple sphere drawing algorithm to render the control points.

The Bézier curve positions themselves are calculated using <a href="https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm" target="_blank" rel="noopener noreferrer">de Casteljau</a> algorithm setting the colours with $(s, t)$ modulating the red and blue colour channels.



<br style="clear: both;">

{: .text-left}

## Spaceship Demo in OpenGL

<div class="align-right img-small">
<video controls autoplay muted loop style="max-width: 100%; height: auto;">
    <source src="/assets/videos/rocket.mp4" type="video/mp4">
</video>
</div>

Computer Graphics project in OpenGL.


<!-- <div id="slider">
  <div class="image-container align-left img-small">
    <img src="{{ '/assets/images/raytracer.png' | relative_url }}" class="active" alt="Image 1">
    <img src="{{ '/assets/images/fresnelrefraction.png' | relative_url }}" alt="Image 2">
    <img src="{{ '/assets/images/shadows.png' | relative_url }}" alt="Image 3">

    <button class="nav-button left" onclick="prevImage()">❮</button>
    <button class="nav-button right" onclick="nextImage()">❯</button>
  </div>
</div> -->

<style>
  #slider {
    /* max-width: 600px; */
    margin: auto;
  }

  .image-container {
    position: relative;
  }

  #slider img {
    width: 100%;
    height: auto;
    display: none;
  }

  #slider img.active {
    display: block;
  }

  .nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(128, 128, 128, 0.5);
    border: none;
    color: white;
    font-size: 24px;
    padding: 12px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  }

  .nav-button.left {
    left: 10px;
  }

  .nav-button.right {
    right: 10px;
  }

  .image-container:hover .nav-button {
    opacity: 1;
  }

  .nav-button:hover {
    background-color: rgba(100, 100, 100, 0.7);
  }
</style>

<script>
  document.addEventListener("DOMContentLoaded", function () {
    const images = document.querySelectorAll("#slider img");
    let current = 0;

    function showImage(index) {
      images.forEach((img, i) => {
        img.classList.toggle("active", i === index);
      });
    }

    window.nextImage = function () {
      current = (current + 1) % images.length;
      showImage(current);
    }

    window.prevImage = function () {
      current = (current - 1 + images.length) % images.length;
      showImage(current);
    }

    showImage(current);
  });
</script>
