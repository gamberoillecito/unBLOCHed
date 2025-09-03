# What is the Bloch sphere?

Quantum states can be described in different ways.
One way is to use the Dirac notation, that we introduced in the previous chapter.

Using this notation, the state is written as:
$$ |\psi \rangle = \alpha |0\rangle + \beta |1\rangle $$
Where $\alpha$ and $\beta$ are complex numbers and $|\alpha|^2 + |\beta|^2 = 1$. 

Another way of writing the same thing is by using a complex 2D vector. This is done in a very straightforward way: the first entry contains the coefficient $\alpha$, the second one contains $\beta$. 

In formulas:
$$ \ket\psi = \begin{pmatrix} \alpha \\ \beta  \end{pmatrix}$$
Where $\alpha$ and $\beta$ are complex numbers and $|\alpha|^2 + |\beta|^2 = 1$. 

Quantum states can be also described using a 2x2 Complex matrix. This matrix is called "density matrix" and is often denoted as $\rho$. The Matrix description can be easily obtained from the vectorial one by computing a the Column-Row product of the vector and its complex conjugate.

For clarity is useful to look at an example. The density matrix associated to the state $\ket \psi$ can be computed as:

$$

\rho = 

\begin{pmatrix}

\alpha \\

\beta

\end{pmatrix}

\begin{pmatrix}

\alpha^* & \beta^*

\end{pmatrix}

\begin{pmatrix}

|\alpha|^2 & \alpha\beta^* \\

\alpha^*\beta & |\beta|^2

\end{pmatrix}

$$

Finally, we get to the description that we are most interested in: the Bloch sphere representation. 

This is a geometric representation of a qubit's quantum state. It provides an intuitive way to visualize the state of a qubit as a vector inscribed in an unitary sphere (i.e. a sphere with radius equal to one).

Mathematically, this representation uses other two parameters to describe the state rather than $\alpha$ and $\beta$. Such parameters are commonly labeled ad $\theta$ and $\phi$, and are real numbers defined on this intervals: $\theta \in [0, \pi]$ , $\phi \in [0, 2 \pi]$. 
Therefore, they can be used as [spherical coordinates](https://en.wikipedia.org/wiki/Spherical_coordinate_system) on the unitary sphere.

To understand how $\theta$ and $\phi$  are related to the probability amplitudes we can use the Dirac's notation. We can write any state $\ket \psi$ as:

$$|\psi\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + e^{i\phi}\sin\left(\frac{\theta}{2}\right)|1\rangle$$

We can than identify $\alpha = \cos\left(\frac{\theta}{2}\right)$ and $\beta = e^{i\phi} \sin\left(\frac{\theta}{2}\right)$. With this choice, for any value of $\theta$ and $\phi$ we get valid probability amplitudes, that fulfill: $|\alpha|^2 + |\beta|^2 = 1$.

In the next chapter, you will develop a more in depth intuition their the role in the Bloch sphere representation.