# un**BLOCH**ed - Bloch sphere simulator  <img alt="DOI" src="https://zenodo.org/badge/DOI/10.5281/zenodo.17087795.svg" />

I created this website during my last year of the Master's degree in Quantum Engineering as a way to learn more on the topic and about web-developement. 

<img width="45%" alt="image" src="https://github.com/user-attachments/assets/32c0f059-6c1c-4133-a90b-ee427b48e633" />
<img width="45%"  alt="floorp_tJ5qx5463K" src="https://github.com/user-attachments/assets/46476b5e-d62b-49c9-be21-bcd50081415c" />

The goal of the website is to give users a quick and easy way to "skecth" some ideas without needing to code, while allowing them as much flexibility as possible.


## Project status <img alt="lastCommit" src="https://img.shields.io/github/last-commit/gamberoillecito/unBLOCHed/development"/>

The project is currently being maintained and new features are planned and will be published as soon as they are ready. 

All the development is done in the `development` branch. The branch is automatically synched with the beta version of the website, which you can find at [beta.unBLOCHed.xyz](https://beta.unBLOCHed.xyz)


## Features

- [X] ✍️**Latex input**: All values can be inserted in a user-friendly way using the usual LaTeX commands, with the benefit of smart recognition of the most common symbols. To type $\phi$ simply write `phi`, to insert a fraction, typing `\` is sufficient.
- [X] 🆗**Custom matrices with validation**: Both the density matrix and the gate matrix can be fully customized and instant validation is performed to give the user a feedback of what they are typing. Example: if a gate matrix is not unitary, the user is warned and stopped from proceeding.
- [X] **Vector notation**: Users can switch between density matrix and state vector notation to interact with pure states.
- [X] 🌐**3D visualization**: The 3D view of the Bloch sphere reacts instantly to the changes done by the user and can be customized to show or hide different visual aids.
- [X] 🖼**Image export**: You can export the 3D scene as a PNG image with a single click. (_Hamburger menu in the 3D scene_ $\rightarrow$ _Save Image_)
- [X] 🕹**Joystick mode**: No more frustating "3D" drawing of the Bloch spehre or animations using your arms to show what you mean! Now you can control the Bloch vector as in a video game using your mouse and/or keyboard.
- [X] ❓**Tutorial**: A simple and easy to understand **interactive** explanation for novice users and students, to learn more about quantum computing and information.
- [X] 📱**Mobile support**: Good support for small screens and/or touch devices.
- [X] **Mixed states**: Mixed states are fully supported.
- [ ] **Noise**: Noise simulation is almost ready on the beta page. Check it out at [beta.unBLOCHed.xyz](https://beta.unBLOCHed.xyz)

## Coming soon

I have a lot more features planned for the simulator and would be happy to hear what you think:

- [ ] **Paper mode for the 3D scene**: I would like to add an option to customize the look of the 3D scene to make it look like a sketch that could be more suitable for printing or to include in a document.
- [ ] **Quantum operations**: I have implemented general quantum operation (through the *operator sum representation*) as the underlying structure for noise but at the moment there is no way for the user to create a custom quantum operation. The main reason why I'm waiting to add this feature is that I think the UI would be too cluttered and probably be more of an annoiance than a useful thing.
- [ ] **Measurement**: I would like to add a simple feature that allows to see the probabilities of a projective measurement given a basis. Now that quantum operations have been implemented it shouldn't be too difficult.
- [ ] **Time evolution**: I plan on adding a way to simulate the time evolution of the Bloch sphere according to some model (e.g. Bloch-Redfield). This would allow user to press "Play" to see how the Bloch vector would evolve as time passes.


## Documentation and bibliography

Although there isn't a real documentation for the code, I tried to comment as much as possible the most critical sections.

Moreover, where needed, I added comments linking to the source of specific formulas or assumptions used in the code (mostly pointing to a specific page of the book [Quantum Computation and Quantum Information](https://doi.org/10.1017/CBO9780511976667) )
