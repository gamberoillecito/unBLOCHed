# un**BLOCH**ed - Bloch sphere simulator

<img alt="DOI" src="https://zenodo.org/badge/DOI/10.5281/zenodo.17087795.svg" />

I created this website during my last year of the Master's degree in Quantum Engineering as a way to learn more on the topic and about web-developement. 

<img width="45%" alt="image" src="https://github.com/user-attachments/assets/32c0f059-6c1c-4133-a90b-ee427b48e633" />
<img width="45%"  alt="floorp_tJ5qx5463K" src="https://github.com/user-attachments/assets/46476b5e-d62b-49c9-be21-bcd50081415c" />


The goal of the website is to give users a quick and easy way to "skecth" some ideas without needing to code, while allowing them as much flexibility as possible.

## Features

- [X] ✍️**Latex input**: All values can be inserted in a user-friendly way using the usual LaTeX commands, with the benefit of smart recognition of the most common symbols. To type $\phi$ simply write `phi`, to insert a fraction, typing `\` is sufficient. (_This wouldn't be possible without the amazing [https://mathlive.io/](mathlive.io) and the support of its creator_).
- [X] 🆗**Custom matrices with validation**: Both the density matrix and the gate matrix can be fully customized and instant validation is performed to give the user a feedback of what they are typing. Example: if a gate matrix is not unitary, the user is warned and stopped from proceeding.
- [X] 🌐**3D visualization**: The 3D view of the Bloch sphere reacts instantly to the changes done by the user and can be customized to show or hide different visual aids.
- [X] 🖼**Image export**: You can export the 3D scene as a PNG image with a single click. (_Hamburger menu in the 3D scene_ $\rightarrow$ _Save Image_)
- [X] 🕹**Joystick mode**: No more frustating "3D" drawing of the Bloch spehre or animations using your arms to show what you mean! Now you can control the Bloch vector as in a video game using your mouse and/or keyboard.
- [X] ❓**Tutorial**: A simple and easy to understand **interactive** explanation for novice users and students, to learn more about quantum computing and information.
- [ ] 📱**Mobile support**: Partial support for small screens and/or touch devices. There are still some bugs that need to be fixed but many features are already working!
- [ ] **Mixed states**: Partial support for mixed states is already present but I plan to expand this in the future, so stay tuned for an update! 

## Coming soon

I have a lot more features planned for the simulator and would be happy to hear what you think:

- [ ] **Vector notation**: So far the only way to input a new state is to insert its density matrix, I would like to allow users to write something like $\Psi = \alpha |0 \rangle + \beta |1 \rangle$ to make it easier to experiment.
- [ ] **Time evolution**: I plan on adding a way to simulate the time evolution of the Bloch sphere according to some model (e.g. Bloch-Redfield). This would allow user to press "Play" to see how the Bloch vector would evolve as time passes.
- [ ] **Noise**: I would like to allow the implementation of some sort of noise on the state.
- [ ] **Measurement**: I would like to add a simple feature that allows to see the probabilities of a projective measurement given a basis.

