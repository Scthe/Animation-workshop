## Animation workshop ([Demo](http://scthe.github.io/Animation-workshop/dist))


When You watched Toy Story as a kid, You might have wondered how it is possible for the fictional, non-existent characters to move and express a wide range of emotions. This demo allows You to become an animator and discover the fun of making things come to life.

![animation-preview]

*Example animation. Remember to always use a reference! Scene file available to import [here](gh-images/animation-preview.anim.json)*


## Dictionary


* **Transformation** - combination of position, rotation and scale to express the state of an object at a given point in time.
* **Keyframe** - manually created transformation at a GIVEN point in time. Usually represents a clear, well-defined and recognizable pose.
* **Interpolated frame** - frame that is not a keyframe. To calculate object's transformation for Interpolated frame, we blend between 2 neighboring keyframes (either as LERP or SLERP).
* **Timeline** - collection of all keyframes for a single object.
* **Bone** - local transformation that affects some part of the 3d object. Just like an arm bone allows You to perform a wide range of motions with the whole upper limb independent of rest of the body.
* **Armature/Skeleton** - collection of bones (usually represented as a hierarchy).
* **Rigging** - process of assigning skeleton to 3d object. In more technical terms, You assign weights between vertices and bones.


## How to use


The animating process consists of adding **keyframes** to the **timeline**. Easier explanation would be to just pose character at different points in time and have the computer generate transitions. The basic **transformations** are: move, rotate, and scale (the last one is not available in this app). You can also apply the transformations only to selected parts of the object - each such part is said to be controlled by a different **bone**. Just like skeletal system in the human body, when You move e.g. upper arm, the rest of the bones (in the lower arm and hand) will follow. This is represented as a hierarchy of bones called **armature** or **skeleton**. By manipulating the bones, You can create the pose that You like. For certain bones, some transformations can be disabled using constraint system (limiting degrees of freedom - DOF). This is done during rigging to prevent unnatural or accidental changes from happening.

After keyframes are placed, the missing frames (often called in-betweens) can be easily calculated through **interpolation**. If an object at time=0s is at position (0, 0, 0) and at position (2, 0, 0) at time=4s, we can easily derive the position between these keyframes. E.g. at time=2s the position would be (1, 0, 0), exactly halfway between. The algorithm we have just used is known as linear interpolation - [LERP](https://en.wikipedia.org/wiki/Linear_interpolation). There are other types of interpolation / easing functions e.g. rotation usually uses spherical linear interpolation - [SLERP](https://en.wikipedia.org/wiki/Slerp).

All of the above-mentioned mechanisms has been implemented in this app.


## User interface

![UI_Instruction]

*Press the '?' button on toolbar below 3d viewport to access help system*

#### Viewport

The 3d view is known as a **viewport**. This is Your window into the scene. Use the `[W, S, A, D]` keys to move and `[Z,  SPACEBAR]` to fly up or down. Click in empty space and drag to rotate the camera. Select the object/bone by clicking on the purple dot with left mouse button. After selecting an object, the transformation manipulators (known as gizmos) will appear. Move gizmo consists of 3 arrows, one for each axis X, Y, Z. Click on the **tip of the arrow** and drag to move along dragged axis. Rotate gizmo has a shape of the ball with 3 axis marked by colored circles. On each circle there is bigger dot that can be dragged **horizontally** to rotate object around respective axis. Not all transformations are available for all bones, as some constraints have been prepared.

Performing transformation (move/rotate) automatically inserts keyframe for selected object at the current point in time. All transformations are calculated in local space.

#### Toolbar

Located below the viewport, the toolbar has some of the most commonly used tools:

* next/previous frame `[G, F]` - change current point in time (frame).
* play/stop `[V]` - lock the user interface, and play the animation in real time. Use 'preview range' feature to limit start/end range.
* current frame input - number indicating currently displayed frame. Every transformation will always create keyframe at this frame.
* next/previous keyframe - switch to frame that is a keyframe.
* move/duplicate keyframe - change time for current keyframe (or a copy). Only for frames that are keyframes.
* delete keyframe
* transformation tools (gizmos) `[Q, E, R]`
* hide markers `[H]` - temporarily hide Viewport UI to see current pose without clutter.
* help - display in-app help view.

#### Timeline Axis

Visualization of current timeline. Red line represents current frame. Yellow bars indicate that the currently selected object has a keyframe at that frame. Dashed bars indicate keyframes of inactive objects - useful to synchronize transformations between different bones. You can switch units between seconds/frames in 'General settings'.


#### Object settings

Located on the right side of the screen, under 'Object' tab. Contains information about currently selected object - name, frame type (keyframe/interpolated), transformation values. If You want, exact values can be provided by hand. Since rotations are stored as quaternions, the respective inputs have been disabled (the values can still be previewed).


#### Global settings

Located on the right side of the screen, under 'Global' tab. Contains general app settings:

* rotation interpolation style - either LERP or SLERP.
* displayed units - either seconds or native frames.
* preview range - limit playback to a selected range of frames. Useful when working on part of the animation. Complements the playback system.
* camera move/rotate speed
* size of object selection circles and transformation manipulators
* debug markers - some internal debug information, mainly for move tool
* import/export - save the animation to external file. Since the file is just plain JSON, it can be edited by hand.
* reset scene - remove all keyframes from ALL objects. Don't worry, there is a confirmation dialog.



## Where do I go from here?

Here are some links and tips to get You started:

* Gather some references. A lot of references.
* [Disney's Twelve Basic Principles of Animation](https://en.wikipedia.org/wiki/12_basic_principles_of_animation), especially [Secondary animation](https://en.wikipedia.org/wiki/Secondary_animation) - google more for examples
* [Making Fluid and Powerful Animations For Skullgirls](https://www.youtube.com/watch?v=Mw0h9WmBlsw) by Mariel Cartwright
* [Animation Systems Analysis - Horizon: Zero Dawn](https://www.youtube.com/watch?v=qo0KjY170dM) and [The Last of Us 2 - E3 Demo - Animation Analysis](https://www.youtube.com/watch?v=Nl8k8nR1h2Y) by Dan Lowe
* [The First Person Animation of Overwatch](https://www.youtube.com/watch?v=7t0hLZd_8Z4) by Matthew Boehm
* [The Animator's Survival Kit](https://en.wikipedia.org/wiki/The_Animator%27s_Survival_Kit) by Richard Williams
* [Pixar in a Box](https://www.khanacademy.org/partner-content/pixar) by Pixar Animation Studios and Khan Academy
* [Building an Animation Runtime and Pipeline / Maurizio de Pascale Ph.D, IO Interactive A/A](https://www.youtube.com/watch?v=QurTzG5vzKw) by Maurizio de Pascale Ph.D
* [Blender](https://www.blender.org/)


## Running locally

1. `yarn install`
2. `yarn start` <- dev server
3. go to `localhost:9000`

Alternatively, `yarn build` for production build, outputs will be in `dist` folder.



[animation-preview]:gh-images/animation-preview.gif
[UI_Instruction]:gh-images/UI_Instruction.png
