import type { Subject, Subtopic } from '@/types';

// JEE syllabus — Physics + Chemistry + Mathematics (Class 11 + 12 NCERT-aligned).
// 4-level hierarchy: Subject → Chapter → Topic → Subtopic.
// Subtopics are the most granular unit; questions can live at topic OR subtopic level.

// ─── Helper to keep subtopic objects compact ────────────────────────────────
const st = (topicId: string, id: string, name: string, questionCount?: number): Subtopic => ({
  id,
  topicId,
  name,
  questionCount,
});

export const PHYSICS: Subject = {
  id: 'physics',
  name: 'Physics',
  chapters: [
    {
      id: 'ch-units-measurements',
      subjectId: 'physics',
      name: 'Units & Measurements',
      classLevel: 11,
      topics: [
        {
          id: 'tp-dimensional-analysis', chapterId: 'ch-units-measurements',
          name: 'Dimensional Analysis', questionCount: 24,
          subtopics: [
            st('tp-dimensional-analysis', 'st-dim-homogeneity', 'Principle of Homogeneity'),
            st('tp-dimensional-analysis', 'st-dim-conversion', 'Conversion of Units'),
          ],
        },
        {
          id: 'tp-significant-figures', chapterId: 'ch-units-measurements',
          name: 'Significant Figures', questionCount: 18,
          subtopics: [
            st('tp-significant-figures', 'st-sig-counting', 'Counting Significant Digits'),
            st('tp-significant-figures', 'st-sig-arithmetic', 'Arithmetic with Sig Figs'),
          ],
        },
        {
          id: 'tp-error-analysis', chapterId: 'ch-units-measurements',
          name: 'Error Analysis', questionCount: 21,
          subtopics: [
            st('tp-error-analysis', 'st-err-types', 'Absolute, Relative & Percentage Errors'),
            st('tp-error-analysis', 'st-err-combination', 'Combination of Errors'),
          ],
        },
      ],
    },
    {
      id: 'ch-kinematics', subjectId: 'physics', name: 'Kinematics', classLevel: 11,
      topics: [
        {
          id: 'tp-motion-1d', chapterId: 'ch-kinematics', name: 'Motion in 1D', questionCount: 32,
          subtopics: [
            st('tp-motion-1d', 'st-1d-uniform', 'Uniformly Accelerated Motion'),
            st('tp-motion-1d', 'st-1d-freefall', 'Free Fall under Gravity'),
          ],
        },
        {
          id: 'tp-motion-2d', chapterId: 'ch-kinematics', name: 'Motion in 2D (Projectile)', questionCount: 28,
          subtopics: [
            st('tp-motion-2d', 'st-2d-horizontal', 'Projectile from Horizontal'),
            st('tp-motion-2d', 'st-2d-elevation', 'Projectile from Elevation'),
          ],
        },
        {
          id: 'tp-relative-velocity', chapterId: 'ch-kinematics', name: 'Relative Velocity', questionCount: 19,
          subtopics: [
            st('tp-relative-velocity', 'st-rv-1d', 'Relative Motion in 1D'),
            st('tp-relative-velocity', 'st-rv-2d', 'Relative Motion in 2D (Rivers, Planes)'),
          ],
        },
      ],
    },
    {
      id: 'ch-laws-of-motion', subjectId: 'physics', name: 'Laws of Motion', classLevel: 11,
      topics: [
        {
          id: 'tp-newtons-laws', chapterId: 'ch-laws-of-motion', name: "Newton's Laws", questionCount: 26,
          subtopics: [
            st('tp-newtons-laws', 'st-nl-first-second', "Newton's First & Second Laws"),
            st('tp-newtons-laws', 'st-nl-action-reaction', 'Action–Reaction Pairs'),
          ],
        },
        {
          id: 'tp-friction', chapterId: 'ch-laws-of-motion', name: 'Friction', questionCount: 22,
          subtopics: [
            st('tp-friction', 'st-fr-static-kinetic', 'Static & Kinetic Friction'),
            st('tp-friction', 'st-fr-incline', 'Friction on Inclines'),
          ],
        },
        {
          id: 'tp-circular-motion', chapterId: 'ch-laws-of-motion', name: 'Circular Motion', questionCount: 24,
          subtopics: [
            st('tp-circular-motion', 'st-cm-uniform', 'Uniform Circular Motion'),
            st('tp-circular-motion', 'st-cm-banking', 'Banking of Roads'),
          ],
        },
      ],
    },
    {
      id: 'ch-rotational-motion', subjectId: 'physics', name: 'Rotational Motion', classLevel: 11,
      topics: [
        {
          id: 'tp-moment-of-inertia', chapterId: 'ch-rotational-motion', name: 'Moment of Inertia', questionCount: 30,
          subtopics: [
            st('tp-moment-of-inertia', 'st-moi-shapes', 'MoI of Standard Shapes (Rod, Disc, Ring, Sphere)'),
            st('tp-moment-of-inertia', 'st-moi-theorems', 'Parallel & Perpendicular Axis Theorems'),
          ],
        },
        {
          id: 'tp-torque', chapterId: 'ch-rotational-motion', name: 'Torque', questionCount: 25,
          subtopics: [
            st('tp-torque', 'st-tq-about-axis', 'Torque about an Axis'),
            st('tp-torque', 'st-tq-equilibrium', 'Equilibrium Conditions'),
          ],
        },
        {
          id: 'tp-angular-momentum', chapterId: 'ch-rotational-motion', name: 'Angular Momentum', questionCount: 20,
          subtopics: [
            st('tp-angular-momentum', 'st-am-conservation', 'Conservation of Angular Momentum'),
            st('tp-angular-momentum', 'st-am-rolling', 'Rolling Motion'),
          ],
        },
      ],
    },
    {
      id: 'ch-thermodynamics', subjectId: 'physics', name: 'Thermodynamics', classLevel: 11,
      topics: [
        {
          id: 'tp-laws-thermo', chapterId: 'ch-thermodynamics', name: 'Laws of Thermodynamics', questionCount: 23,
          subtopics: [
            st('tp-laws-thermo', 'st-thermo-first', 'First Law of Thermodynamics'),
            st('tp-laws-thermo', 'st-thermo-second', 'Second Law (Entropy)'),
          ],
        },
        {
          id: 'tp-carnot-cycle', chapterId: 'ch-thermodynamics', name: 'Carnot Cycle', questionCount: 17,
          subtopics: [
            st('tp-carnot-cycle', 'st-carnot-theorem', "Carnot's Theorem"),
            st('tp-carnot-cycle', 'st-carnot-efficiency', 'Efficiency & Reversibility'),
          ],
        },
        {
          id: 'tp-kinetic-theory', chapterId: 'ch-thermodynamics', name: 'Kinetic Theory of Gases', questionCount: 21,
          subtopics: [
            st('tp-kinetic-theory', 'st-kt-speeds', 'RMS, Mean & Most Probable Speeds'),
            st('tp-kinetic-theory', 'st-kt-equipartition', 'Equipartition of Energy'),
          ],
        },
      ],
    },
    {
      id: 'ch-electrostatics', subjectId: 'physics', name: 'Electrostatics', classLevel: 12,
      topics: [
        {
          id: 'tp-coulombs-law', chapterId: 'ch-electrostatics', name: "Coulomb's Law", questionCount: 28,
          subtopics: [
            st('tp-coulombs-law', 'st-cl-point-charges', 'Force between Point Charges'),
            st('tp-coulombs-law', 'st-cl-superposition', 'Superposition of Forces'),
          ],
        },
        {
          id: 'tp-electric-field', chapterId: 'ch-electrostatics', name: 'Electric Field & Potential', questionCount: 31,
          subtopics: [
            st('tp-electric-field', 'st-ef-due-to-charges', 'Field due to Point Charges'),
            st('tp-electric-field', 'st-ef-potential-dipole', 'Electric Potential & Dipole'),
          ],
        },
        {
          id: 'tp-capacitors', chapterId: 'ch-electrostatics', name: 'Capacitors', questionCount: 26,
          subtopics: [
            st('tp-capacitors', 'st-cap-parallel-plate', 'Parallel-Plate Capacitor'),
            st('tp-capacitors', 'st-cap-combinations', 'Series & Parallel Combinations'),
          ],
        },
      ],
    },
    {
      id: 'ch-current-electricity', subjectId: 'physics', name: 'Current Electricity', classLevel: 12,
      topics: [
        {
          id: 'tp-ohms-law', chapterId: 'ch-current-electricity', name: "Ohm's Law & Resistance", questionCount: 24,
          subtopics: [
            st('tp-ohms-law', 'st-ohm-resistance', 'Resistance of Wires'),
            st('tp-ohms-law', 'st-ohm-combinations', 'Series & Parallel Resistors'),
          ],
        },
        {
          id: 'tp-circuits', chapterId: 'ch-current-electricity', name: 'DC Circuits & Kirchhoff', questionCount: 27,
          subtopics: [
            st('tp-circuits', 'st-cir-kirchhoff', "Kirchhoff's Voltage & Current Laws"),
            st('tp-circuits', 'st-cir-wheatstone', 'Wheatstone Bridge'),
          ],
        },
      ],
    },
    {
      id: 'ch-magnetism', subjectId: 'physics', name: 'Magnetism', classLevel: 12,
      topics: [
        {
          id: 'tp-magnetic-field', chapterId: 'ch-magnetism', name: 'Magnetic Field & Forces', questionCount: 22,
          subtopics: [
            st('tp-magnetic-field', 'st-mag-biot-savart', 'Field due to Currents (Biot–Savart)'),
            st('tp-magnetic-field', 'st-mag-lorentz', 'Force on a Moving Charge'),
          ],
        },
        {
          id: 'tp-electromagnetic-induction', chapterId: 'ch-magnetism', name: 'Electromagnetic Induction', questionCount: 20,
          subtopics: [
            st('tp-electromagnetic-induction', 'st-emi-faraday', "Faraday's Law"),
            st('tp-electromagnetic-induction', 'st-emi-inductance', 'Self & Mutual Inductance'),
          ],
        },
      ],
    },
    {
      id: 'ch-optics', subjectId: 'physics', name: 'Optics', classLevel: 12,
      topics: [
        {
          id: 'tp-ray-optics', chapterId: 'ch-optics', name: 'Ray Optics', questionCount: 25,
          subtopics: [
            st('tp-ray-optics', 'st-ro-prisms-lenses', 'Refraction through Prisms & Lenses'),
            st('tp-ray-optics', 'st-ro-tir', 'Total Internal Reflection'),
          ],
        },
        {
          id: 'tp-wave-optics', chapterId: 'ch-optics', name: 'Wave Optics', questionCount: 19,
          subtopics: [
            st('tp-wave-optics', 'st-wo-ydse', "Young's Double-Slit Experiment"),
            st('tp-wave-optics', 'st-wo-diffraction', 'Diffraction & Polarization'),
          ],
        },
      ],
    },
    {
      id: 'ch-modern-physics', subjectId: 'physics', name: 'Modern Physics', classLevel: 12,
      topics: [
        {
          id: 'tp-photoelectric', chapterId: 'ch-modern-physics', name: 'Photoelectric Effect', questionCount: 18,
          subtopics: [
            st('tp-photoelectric', 'st-pe-einstein', "Einstein's Photoelectric Equation"),
            st('tp-photoelectric', 'st-pe-stopping', 'Stopping Potential'),
          ],
        },
        {
          id: 'tp-atoms-nuclei', chapterId: 'ch-modern-physics', name: 'Atoms & Nuclei', questionCount: 21,
          subtopics: [
            st('tp-atoms-nuclei', 'st-an-bohr-h', 'Bohr Model of Hydrogen'),
            st('tp-atoms-nuclei', 'st-an-decay', 'Radioactive Decay Laws'),
          ],
        },
      ],
    },
  ],
};

export const CHEMISTRY: Subject = {
  id: 'chemistry',
  name: 'Chemistry',
  chapters: [
    {
      id: 'ch-basic-concepts', subjectId: 'chemistry', name: 'Some Basic Concepts of Chemistry', classLevel: 11,
      topics: [
        {
          id: 'tp-mole-concept', chapterId: 'ch-basic-concepts', name: 'Mole Concept', questionCount: 26,
          subtopics: [
            st('tp-mole-concept', 'st-mole-avogadro', "Avogadro's Number & Molar Mass"),
            st('tp-mole-concept', 'st-mole-formulas', 'Empirical & Molecular Formulas'),
          ],
        },
        {
          id: 'tp-stoichiometry', chapterId: 'ch-basic-concepts', name: 'Stoichiometry & Limiting Reagent', questionCount: 22,
          subtopics: [
            st('tp-stoichiometry', 'st-stoich-balancing', 'Balancing Chemical Equations'),
            st('tp-stoichiometry', 'st-stoich-limiting', 'Limiting Reagent Calculations'),
          ],
        },
      ],
    },
    {
      id: 'ch-atomic-structure', subjectId: 'chemistry', name: 'Atomic Structure', classLevel: 11,
      topics: [
        {
          id: 'tp-bohr-model', chapterId: 'ch-atomic-structure', name: "Bohr's Model & Hydrogen Spectrum", questionCount: 24,
          subtopics: [
            st('tp-bohr-model', 'st-bohr-postulates', "Bohr's Postulates"),
            st('tp-bohr-model', 'st-bohr-spectrum', 'Hydrogen Spectrum (Lyman, Balmer)'),
          ],
        },
        {
          id: 'tp-quantum-numbers', chapterId: 'ch-atomic-structure', name: 'Quantum Numbers', questionCount: 20,
          subtopics: [
            st('tp-quantum-numbers', 'st-qn-four-numbers', 'Principal, Azimuthal, Magnetic, Spin'),
            st('tp-quantum-numbers', 'st-qn-rules', 'Pauli & Aufbau Rules'),
          ],
        },
        {
          id: 'tp-electronic-config', chapterId: 'ch-atomic-structure', name: 'Electronic Configuration', questionCount: 18,
          subtopics: [
            st('tp-electronic-config', 'st-ec-elements', 'Electronic Configuration of Elements'),
            st('tp-electronic-config', 'st-ec-stability', 'Stable Half-Filled & Filled Subshells'),
          ],
        },
      ],
    },
    {
      id: 'ch-chemical-bonding', subjectId: 'chemistry', name: 'Chemical Bonding & Molecular Structure', classLevel: 11,
      topics: [
        {
          id: 'tp-covalent-vsepr', chapterId: 'ch-chemical-bonding', name: 'Covalent Bonding & VSEPR', questionCount: 28,
          subtopics: [
            st('tp-covalent-vsepr', 'st-vsepr-shapes', 'Lewis Structures & VSEPR Shapes'),
            st('tp-covalent-vsepr', 'st-vsepr-angles', 'Bond Angles in Polyatomic Molecules'),
          ],
        },
        {
          id: 'tp-hybridization', chapterId: 'ch-chemical-bonding', name: 'Hybridization', questionCount: 24,
          subtopics: [
            st('tp-hybridization', 'st-hyb-sp', 'sp, sp² & sp³ Hybridization'),
            st('tp-hybridization', 'st-hyb-d', 'Hybridization Involving d-Orbitals'),
          ],
        },
      ],
    },
    {
      id: 'ch-chem-thermodynamics', subjectId: 'chemistry', name: 'Chemical Thermodynamics', classLevel: 11,
      topics: [
        {
          id: 'tp-first-law-enthalpy', chapterId: 'ch-chem-thermodynamics', name: 'First Law & Enthalpy', questionCount: 22,
          subtopics: [
            st('tp-first-law-enthalpy', 'st-fle-internal-energy', 'Internal Energy & Enthalpy'),
            st('tp-first-law-enthalpy', 'st-fle-hess', "Hess's Law"),
          ],
        },
        {
          id: 'tp-entropy-gibbs', chapterId: 'ch-chem-thermodynamics', name: 'Entropy & Gibbs Free Energy', questionCount: 19,
          subtopics: [
            st('tp-entropy-gibbs', 'st-eg-spontaneity', 'Entropy & Spontaneity'),
            st('tp-entropy-gibbs', 'st-eg-gibbs', 'ΔG = ΔH − TΔS'),
          ],
        },
      ],
    },
    {
      id: 'ch-equilibrium', subjectId: 'chemistry', name: 'Equilibrium', classLevel: 11,
      topics: [
        {
          id: 'tp-le-chatelier', chapterId: 'ch-equilibrium', name: "Le Chatelier's Principle", questionCount: 21,
          subtopics: [
            st('tp-le-chatelier', 'st-lc-conc-temp', 'Effect of Concentration & Temperature'),
            st('tp-le-chatelier', 'st-lc-pressure-catalyst', 'Effect of Pressure & Catalyst'),
          ],
        },
        {
          id: 'tp-acid-base-ph', chapterId: 'ch-equilibrium', name: 'Acid-Base Equilibria & pH', questionCount: 26,
          subtopics: [
            st('tp-acid-base-ph', 'st-ph-strong-weak', 'Strong vs Weak Acids/Bases'),
            st('tp-acid-base-ph', 'st-ph-buffer', 'Buffer Solutions & pH Calculation'),
          ],
        },
        {
          id: 'tp-solubility-product', chapterId: 'ch-equilibrium', name: 'Solubility Product', questionCount: 17,
          subtopics: [
            st('tp-solubility-product', 'st-ksp-common-ion', 'Common Ion Effect'),
            st('tp-solubility-product', 'st-ksp-precipitation', 'Ksp & Precipitation'),
          ],
        },
      ],
    },
    {
      id: 'ch-hydrocarbons', subjectId: 'chemistry', name: 'Hydrocarbons', classLevel: 11,
      topics: [
        {
          id: 'tp-alkanes', chapterId: 'ch-hydrocarbons', name: 'Alkanes', questionCount: 20,
          subtopics: [
            st('tp-alkanes', 'st-alk-conformations', 'Conformations of Alkanes'),
            st('tp-alkanes', 'st-alk-substitution', 'Substitution Reactions'),
          ],
        },
        {
          id: 'tp-alkenes-alkynes', chapterId: 'ch-hydrocarbons', name: 'Alkenes & Alkynes', questionCount: 25,
          subtopics: [
            st('tp-alkenes-alkynes', 'st-aa-markovnikov', 'Markovnikov & Anti-Markovnikov Addition'),
            st('tp-alkenes-alkynes', 'st-aa-ozonolysis', 'Ozonolysis'),
          ],
        },
        {
          id: 'tp-aromatic-compounds', chapterId: 'ch-hydrocarbons', name: 'Aromatic Compounds (Benzene)', questionCount: 23,
          subtopics: [
            st('tp-aromatic-compounds', 'st-aro-aromaticity', "Aromaticity & Hückel's Rule"),
            st('tp-aromatic-compounds', 'st-aro-eas', 'Electrophilic Aromatic Substitution'),
          ],
        },
      ],
    },
    {
      id: 'ch-solutions', subjectId: 'chemistry', name: 'Solutions', classLevel: 12,
      topics: [
        {
          id: 'tp-colligative-properties', chapterId: 'ch-solutions', name: 'Colligative Properties', questionCount: 22,
          subtopics: [
            st('tp-colligative-properties', 'st-cp-bp-fp', 'Boiling-Point Elevation & Freezing-Point Depression'),
            st('tp-colligative-properties', 'st-cp-osmotic', 'Osmotic Pressure'),
          ],
        },
        {
          id: 'tp-raoults-law', chapterId: 'ch-solutions', name: "Raoult's Law & Vapour Pressure", questionCount: 18,
          subtopics: [
            st('tp-raoults-law', 'st-rl-ideal', 'Ideal vs Non-Ideal Solutions'),
            st('tp-raoults-law', 'st-rl-vapour-pressure', 'Vapour Pressure of Mixtures'),
          ],
        },
      ],
    },
    {
      id: 'ch-electrochemistry', subjectId: 'chemistry', name: 'Electrochemistry', classLevel: 12,
      topics: [
        {
          id: 'tp-galvanic-cells', chapterId: 'ch-electrochemistry', name: 'Galvanic Cells & EMF', questionCount: 24,
          subtopics: [
            st('tp-galvanic-cells', 'st-gc-electrode-potential', 'Standard Electrode Potentials'),
            st('tp-galvanic-cells', 'st-gc-emf', 'EMF of a Cell'),
          ],
        },
        {
          id: 'tp-nernst-equation', chapterId: 'ch-electrochemistry', name: 'Nernst Equation', questionCount: 19,
          subtopics: [
            st('tp-nernst-equation', 'st-ne-derivation', 'Nernst Equation Derivation'),
            st('tp-nernst-equation', 'st-ne-non-standard', 'EMF at Non-Standard Conditions'),
          ],
        },
      ],
    },
    {
      id: 'ch-chemical-kinetics', subjectId: 'chemistry', name: 'Chemical Kinetics', classLevel: 12,
      topics: [
        {
          id: 'tp-rate-laws', chapterId: 'ch-chemical-kinetics', name: 'Rate Laws & Order of Reaction', questionCount: 23,
          subtopics: [
            st('tp-rate-laws', 'st-rl-order', 'Order vs Molecularity'),
            st('tp-rate-laws', 'st-rl-half-life', 'Half-Life of First-Order Reactions'),
          ],
        },
        {
          id: 'tp-arrhenius', chapterId: 'ch-chemical-kinetics', name: 'Arrhenius Equation', questionCount: 17,
          subtopics: [
            st('tp-arrhenius', 'st-ar-activation', 'Activation Energy'),
            st('tp-arrhenius', 'st-ar-temp-dependence', 'Temperature Dependence of Rate Constant'),
          ],
        },
      ],
    },
    {
      id: 'ch-coordination-compounds', subjectId: 'chemistry', name: 'Coordination Compounds', classLevel: 12,
      topics: [
        {
          id: 'tp-werner-theory', chapterId: 'ch-coordination-compounds', name: "Werner's Theory & Nomenclature", questionCount: 21,
          subtopics: [
            st('tp-werner-theory', 'st-wt-valencies', 'Primary & Secondary Valencies'),
            st('tp-werner-theory', 'st-wt-iupac', 'IUPAC Nomenclature of Complexes'),
          ],
        },
        {
          id: 'tp-crystal-field', chapterId: 'ch-coordination-compounds', name: 'Crystal Field Theory', questionCount: 18,
          subtopics: [
            st('tp-crystal-field', 'st-cft-octahedral', 'Octahedral Splitting'),
            st('tp-crystal-field', 'st-cft-spin', 'High-Spin vs Low-Spin Complexes'),
          ],
        },
        {
          id: 'tp-isomerism-complexes', chapterId: 'ch-coordination-compounds', name: 'Isomerism in Complexes', questionCount: 16,
          subtopics: [
            st('tp-isomerism-complexes', 'st-iso-geometric', 'Geometrical Isomerism (cis/trans)'),
            st('tp-isomerism-complexes', 'st-iso-optical', 'Optical Isomerism'),
          ],
        },
      ],
    },
  ],
};

export const MATHEMATICS: Subject = {
  id: 'mathematics',
  name: 'Mathematics',
  chapters: [
    {
      id: 'ch-sets-functions', subjectId: 'mathematics', name: 'Sets, Relations & Functions', classLevel: 11,
      topics: [
        {
          id: 'tp-domain-range', chapterId: 'ch-sets-functions', name: 'Domain & Range', questionCount: 22,
          subtopics: [
            st('tp-domain-range', 'st-dr-common', 'Domain of Common Functions'),
            st('tp-domain-range', 'st-dr-finding', 'Range using Inverse Method'),
          ],
        },
        {
          id: 'tp-composition-functions', chapterId: 'ch-sets-functions', name: 'Composition of Functions', questionCount: 18,
          subtopics: [
            st('tp-composition-functions', 'st-cf-fog', 'f∘g and (f∘g)∘h'),
            st('tp-composition-functions', 'st-cf-restrictions', 'Composition with Restrictions'),
          ],
        },
        {
          id: 'tp-inverse-functions', chapterId: 'ch-sets-functions', name: 'Inverse Functions', questionCount: 17,
          subtopics: [
            st('tp-inverse-functions', 'st-if-existence', 'Existence of Inverse'),
            st('tp-inverse-functions', 'st-if-graphs', 'Graphs of Inverses'),
          ],
        },
      ],
    },
    {
      id: 'ch-trigonometry', subjectId: 'mathematics', name: 'Trigonometry', classLevel: 11,
      topics: [
        {
          id: 'tp-trig-identities', chapterId: 'ch-trigonometry', name: 'Trigonometric Identities', questionCount: 30,
          subtopics: [
            st('tp-trig-identities', 'st-ti-sum-diff', 'Sum & Difference Formulas'),
            st('tp-trig-identities', 'st-ti-multiple', 'Multiple & Sub-Multiple Angle Formulas'),
          ],
        },
        {
          id: 'tp-trig-equations', chapterId: 'ch-trigonometry', name: 'Solutions of Trigonometric Equations', questionCount: 24,
          subtopics: [
            st('tp-trig-equations', 'st-te-general', 'General Solutions'),
            st('tp-trig-equations', 'st-te-multiple-angles', 'Equations Involving Multiple Angles'),
          ],
        },
      ],
    },
    {
      id: 'ch-complex-quadratic', subjectId: 'mathematics', name: 'Complex Numbers & Quadratic Equations', classLevel: 11,
      topics: [
        {
          id: 'tp-argand-plane', chapterId: 'ch-complex-quadratic', name: 'Argand Plane & Modulus-Argument', questionCount: 23,
          subtopics: [
            st('tp-argand-plane', 'st-ap-modulus-arg', 'Modulus and Argument'),
            st('tp-argand-plane', 'st-ap-de-moivre', "De Moivre's Theorem"),
          ],
        },
        {
          id: 'tp-quadratic-roots', chapterId: 'ch-complex-quadratic', name: 'Roots of Quadratic Equations', questionCount: 25,
          subtopics: [
            st('tp-quadratic-roots', 'st-qr-vieta', 'Sum & Product of Roots'),
            st('tp-quadratic-roots', 'st-qr-discriminant', 'Nature of Roots & Discriminant'),
          ],
        },
      ],
    },
    {
      id: 'ch-sequences-series', subjectId: 'mathematics', name: 'Sequences & Series', classLevel: 11,
      topics: [
        {
          id: 'tp-ap-gp', chapterId: 'ch-sequences-series', name: 'Arithmetic & Geometric Progressions', questionCount: 28,
          subtopics: [
            st('tp-ap-gp', 'st-apgp-ap', 'AP: nth Term & Sum'),
            st('tp-ap-gp', 'st-apgp-gp', 'GP: nth Term, Sum & Infinite GP'),
          ],
        },
        {
          id: 'tp-special-series', chapterId: 'ch-sequences-series', name: 'Sum of Special Series', questionCount: 18,
          subtopics: [
            st('tp-special-series', 'st-ss-squares-cubes', 'Sum of Squares & Cubes'),
            st('tp-special-series', 'st-ss-agp', 'Arithmetic-Geometric Series'),
          ],
        },
      ],
    },
    {
      id: 'ch-perm-comb-binomial', subjectId: 'mathematics', name: 'Permutations, Combinations & Binomial Theorem', classLevel: 11,
      topics: [
        {
          id: 'tp-permutations-combinations', chapterId: 'ch-perm-comb-binomial', name: 'Permutations & Combinations', questionCount: 26,
          subtopics: [
            st('tp-permutations-combinations', 'st-pc-permutations', 'Permutations with Restrictions'),
            st('tp-permutations-combinations', 'st-pc-combinations', 'Combinations & Selections'),
          ],
        },
        {
          id: 'tp-binomial-expansion', chapterId: 'ch-perm-comb-binomial', name: 'Binomial Expansion', questionCount: 22,
          subtopics: [
            st('tp-binomial-expansion', 'st-be-general-term', 'General Term & Middle Term'),
            st('tp-binomial-expansion', 'st-be-coefficient', 'Coefficient Extraction'),
          ],
        },
      ],
    },
    {
      id: 'ch-conic-sections', subjectId: 'mathematics', name: 'Conic Sections', classLevel: 11,
      topics: [
        {
          id: 'tp-parabola', chapterId: 'ch-conic-sections', name: 'Parabola', questionCount: 22,
          subtopics: [
            st('tp-parabola', 'st-par-standard', 'Standard Form & Focus-Directrix'),
            st('tp-parabola', 'st-par-tangent', 'Tangent & Normal to a Parabola'),
          ],
        },
        {
          id: 'tp-ellipse', chapterId: 'ch-conic-sections', name: 'Ellipse', questionCount: 20,
          subtopics: [
            st('tp-ellipse', 'st-el-eccentricity', 'Eccentricity & Directrix'),
            st('tp-ellipse', 'st-el-tangent', 'Tangent & Normal to an Ellipse'),
          ],
        },
        {
          id: 'tp-hyperbola', chapterId: 'ch-conic-sections', name: 'Hyperbola', questionCount: 18,
          subtopics: [
            st('tp-hyperbola', 'st-hyp-asymptotes', 'Asymptotes & Conjugate Hyperbola'),
            st('tp-hyperbola', 'st-hyp-tangent', 'Tangent & Normal to a Hyperbola'),
          ],
        },
      ],
    },
    {
      id: 'ch-matrices-determinants', subjectId: 'mathematics', name: 'Matrices & Determinants', classLevel: 12,
      topics: [
        {
          id: 'tp-matrix-operations', chapterId: 'ch-matrices-determinants', name: 'Matrix Operations & Inverse', questionCount: 24,
          subtopics: [
            st('tp-matrix-operations', 'st-mo-multiply', 'Multiplication & Transpose'),
            st('tp-matrix-operations', 'st-mo-inverse', 'Inverse via Adjugate'),
          ],
        },
        {
          id: 'tp-determinants-cofactors', chapterId: 'ch-matrices-determinants', name: 'Determinants & Cofactors', questionCount: 20,
          subtopics: [
            st('tp-determinants-cofactors', 'st-dc-properties', 'Properties of Determinants'),
            st('tp-determinants-cofactors', 'st-dc-cofactor', 'Expansion using Cofactors'),
          ],
        },
        {
          id: 'tp-system-linear-equations', chapterId: 'ch-matrices-determinants', name: 'System of Linear Equations', questionCount: 19,
          subtopics: [
            st('tp-system-linear-equations', 'st-sle-cramer', "Cramer's Rule"),
            st('tp-system-linear-equations', 'st-sle-consistency', 'Consistency of Equations'),
          ],
        },
      ],
    },
    {
      id: 'ch-continuity-derivatives', subjectId: 'mathematics', name: 'Continuity, Differentiability & Derivatives', classLevel: 12,
      topics: [
        {
          id: 'tp-limits', chapterId: 'ch-continuity-derivatives', name: 'Limits', questionCount: 28,
          subtopics: [
            st('tp-limits', 'st-lim-standard', 'Standard Limits (sin x / x, etc.)'),
            st('tp-limits', 'st-lim-lhopital', "L'Hôpital's Rule & Indeterminate Forms"),
          ],
        },
        {
          id: 'tp-continuity', chapterId: 'ch-continuity-derivatives', name: 'Continuity & Differentiability', questionCount: 24,
          subtopics: [
            st('tp-continuity', 'st-cont-point', 'Continuity at a Point & on an Interval'),
            st('tp-continuity', 'st-cont-chain', 'Differentiability & Chain Rule'),
          ],
        },
        {
          id: 'tp-tangents-normals', chapterId: 'ch-continuity-derivatives', name: 'Tangents & Normals', questionCount: 21,
          subtopics: [
            st('tp-tangents-normals', 'st-tn-slope', 'Slope of Tangent at a Point'),
            st('tp-tangents-normals', 'st-tn-normal', 'Equation of Normal'),
          ],
        },
      ],
    },
    {
      id: 'ch-integration', subjectId: 'mathematics', name: 'Integration', classLevel: 12,
      topics: [
        {
          id: 'tp-indefinite-integrals', chapterId: 'ch-integration', name: 'Indefinite Integrals', questionCount: 30,
          subtopics: [
            st('tp-indefinite-integrals', 'st-ii-standard', 'Standard Integrals & Substitution'),
            st('tp-indefinite-integrals', 'st-ii-by-parts', 'Integration by Parts'),
          ],
        },
        {
          id: 'tp-definite-integrals', chapterId: 'ch-integration', name: 'Definite Integrals & Properties', questionCount: 26,
          subtopics: [
            st('tp-definite-integrals', 'st-di-properties', 'Properties of Definite Integrals'),
            st('tp-definite-integrals', 'st-di-limits', 'Definite Integrals with Limits'),
          ],
        },
        {
          id: 'tp-area-under-curves', chapterId: 'ch-integration', name: 'Area Under Curves', questionCount: 18,
          subtopics: [
            st('tp-area-under-curves', 'st-au-axis', 'Area between Curve & Axis'),
            st('tp-area-under-curves', 'st-au-curves', 'Area between Two Curves'),
          ],
        },
      ],
    },
    {
      id: 'ch-vectors-3d', subjectId: 'mathematics', name: 'Vectors & 3D Geometry', classLevel: 12,
      topics: [
        {
          id: 'tp-vector-algebra', chapterId: 'ch-vectors-3d', name: 'Vector Algebra (Dot & Cross)', questionCount: 23,
          subtopics: [
            st('tp-vector-algebra', 'st-va-dot', 'Dot Product & Projection'),
            st('tp-vector-algebra', 'st-va-cross', 'Cross Product & Area'),
          ],
        },
        {
          id: 'tp-lines-planes-3d', chapterId: 'ch-vectors-3d', name: 'Lines & Planes in 3D', questionCount: 21,
          subtopics: [
            st('tp-lines-planes-3d', 'st-lp-line', 'Vector & Cartesian Forms of a Line'),
            st('tp-lines-planes-3d', 'st-lp-plane', 'Equation of a Plane'),
          ],
        },
      ],
    },
  ],
};

export const SUBJECTS: Subject[] = [PHYSICS, CHEMISTRY, MATHEMATICS];

// ─── Lookup helpers ────────────────────────────────────────────────────────

export function getAllTopics() {
  return SUBJECTS.flatMap((s) => s.chapters.flatMap((ch) => ch.topics));
}

export function getAllSubtopics(): Subtopic[] {
  return getAllTopics().flatMap((t) => t.subtopics);
}

export function getTopicById(id: string) {
  return getAllTopics().find((t) => t.id === id);
}

export function getSubtopicById(id: string): Subtopic | undefined {
  return getAllSubtopics().find((s) => s.id === id);
}

export function getChapterById(id: string) {
  return SUBJECTS.flatMap((s) => s.chapters).find((c) => c.id === id);
}

export function getChapterByTopic(topicId: string) {
  return SUBJECTS.flatMap((s) => s.chapters).find((c) =>
    c.topics.some((t) => t.id === topicId)
  );
}

export function getSubjectById(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function getSubjectByTopic(topicId: string): Subject | undefined {
  for (const s of SUBJECTS) {
    if (s.chapters.some((c) => c.topics.some((t) => t.id === topicId))) return s;
  }
  return undefined;
}

export function getTopicBySubtopic(subtopicId: string) {
  return getAllTopics().find((t) => t.subtopics.some((s) => s.id === subtopicId));
}
