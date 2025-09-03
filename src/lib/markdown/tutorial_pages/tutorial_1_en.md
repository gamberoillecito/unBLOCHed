# What is a Qubit?
A qubit (short for quantum bit) is the basic unit of quantum information.
They are the quantum version of the classical binary bit. 

While a classical has only two possible state (0 or 1), a quantum bit can be in a superposition of both states at the same time. In the context of quantum information, the two states are typically denoted as $\ket 0$ and $\ket 1$. Is common to call this state "basis states"

This way of writing quantum states is called "[Dirac Notation](https://en.wikipedia.org/wiki/Bra%E2%80%93ket_notation)". 

The meaning of the word "superposition" is easier to understand by looking at the mathematical definition of a quantum state.
Mathematically, a qubit's state is represented as:
$$ |\psi \rangle = \alpha |0\rangle + \beta |1\rangle $$
Where $\alpha$ and $\beta$ are complex numbers and $|\alpha|^2 + |\beta|^2 = 1$. They are often called "**Probability amplitudes**"

An intuitive way of looking at this formula is that a quantum state $\ket\psi$ is a mixture of the two states $\ket 0$ and $\ket 1$ and the coefficients $\alpha$ and $\beta$ tell you the proportions in wich $\ket 0$ and $\ket 1$ are mixed.

In the chapter about quantum states we will see some interactive examples to better understand this concept.

Quantum bits can be encoded using different physical systems. Some examples are: photons, electrons and superconducting qubits.
