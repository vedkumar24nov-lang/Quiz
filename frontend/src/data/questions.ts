import type { Question } from '@/types';

// Hand-authored Physics dummy questions covering all 4 cognitive types and 3 difficulties.
// Real PYQs go in DB during S3 — these are enough to exercise the UI loop.

export const QUESTIONS: Question[] = [
  // ─── Rotational Motion → Moment of Inertia ───
  {
    id: 'q-001',
    topicId: 'tp-moment-of-inertia',
    difficulty: 'Easy',
    type: 'Recall',
    format: 'mcq',
    stem: 'The moment of inertia of a thin uniform rod of mass M and length L about an axis perpendicular to the rod and passing through its centre is:',
    options: ['ML²/12', 'ML²/3', 'ML²/2', 'ML²/6'],
    correctAnswer: 0,
    solution: 'For a thin uniform rod, the moment of inertia about the perpendicular axis through its centre is ML²/12. Using the parallel-axis theorem, about the end it becomes ML²/3.',
    estimatedTimeSeconds: 60,
  },
  {
    id: 'q-002',
    topicId: 'tp-moment-of-inertia',
    difficulty: 'Medium',
    type: 'Conceptual',
    format: 'mcq',
    stem: 'Two solid spheres A and B have the same mass but A has twice the radius of B. The ratio of moments of inertia I_A : I_B about their respective diameters is:',
    options: ['1 : 1', '2 : 1', '4 : 1', '1 : 4'],
    correctAnswer: 2,
    solution: 'Moment of inertia of a solid sphere about its diameter = (2/5)MR². With same mass, I ∝ R². If R_A = 2R_B, then I_A/I_B = 4.',
    estimatedTimeSeconds: 90,
  },
  {
    id: 'q-003',
    topicId: 'tp-moment-of-inertia',
    difficulty: 'Hard',
    type: 'Analytical',
    format: 'numerical',
    stem: 'A uniform disc of mass 2 kg and radius 0.5 m rolls without slipping on a horizontal surface. If its centre of mass moves with a velocity of 3 m/s, calculate its total kinetic energy in joules.',
    correctAnswer: 13.5,
    solution: 'Total KE = (1/2)Mv² + (1/2)Iω². For a disc rolling without slipping, I = (1/2)MR² and v = Rω, so (1/2)Iω² = (1/4)Mv². Total = (1/2)(2)(9) + (1/4)(2)(9) = 9 + 4.5 = 13.5 J.',
    estimatedTimeSeconds: 180,
  },
  {
    id: 'q-004',
    topicId: 'tp-moment-of-inertia',
    difficulty: 'Hard',
    type: 'Application',
    format: 'mcq',
    stem: 'A flywheel in a car engine has moment of inertia 0.4 kg·m². The engine applies a torque of 20 N·m for 5 seconds starting from rest. The angular velocity acquired (in rad/s) is:',
    options: ['100', '200', '250', '50'],
    correctAnswer: 2,
    solution: 'Angular acceleration α = τ/I = 20/0.4 = 50 rad/s². After t = 5s starting from rest: ω = αt = 250 rad/s.',
    estimatedTimeSeconds: 120,
  },

  // ─── Rotational Motion → Torque ───
  {
    id: 'q-005',
    topicId: 'tp-torque',
    difficulty: 'Easy',
    type: 'Recall',
    format: 'mcq',
    stem: 'The SI unit of torque is:',
    options: ['N/m', 'N·m', 'kg·m/s²', 'J/s'],
    correctAnswer: 1,
    solution: 'Torque = force × perpendicular distance, so its SI unit is Newton-metre (N·m). Note this is dimensionally same as Joule but is never written as J for torque.',
    estimatedTimeSeconds: 45,
  },
  {
    id: 'q-006',
    topicId: 'tp-torque',
    difficulty: 'Medium',
    type: 'Application',
    format: 'numerical',
    stem: 'A uniform horizontal rod of length 2 m and mass 4 kg is pivoted at one end. Calculate the torque (in N·m) about the pivot due to gravity when the rod is held horizontal. (Take g = 10 m/s²)',
    correctAnswer: 40,
    solution: 'Weight acts at the centre of the rod, 1 m from the pivot. Torque = mg × (L/2) = 4 × 10 × 1 = 40 N·m.',
    estimatedTimeSeconds: 90,
  },

  // ─── Thermodynamics → Carnot Cycle ───
  {
    id: 'q-007',
    topicId: 'tp-carnot-cycle',
    difficulty: 'Easy',
    type: 'Recall',
    format: 'mcq',
    stem: 'The efficiency of a Carnot engine operating between temperatures T₁ (hot) and T₂ (cold) is:',
    options: ['1 − T₁/T₂', '1 − T₂/T₁', 'T₂/T₁', 'T₁/T₂ − 1'],
    correctAnswer: 1,
    solution: 'Carnot efficiency η = 1 − T₂/T₁, where temperatures are in Kelvin. Maximum efficiency occurs as T₂ → 0.',
    estimatedTimeSeconds: 60,
  },
  {
    id: 'q-008',
    topicId: 'tp-carnot-cycle',
    difficulty: 'Hard',
    type: 'Conceptual',
    format: 'mcq',
    stem: 'A Carnot engine operates between 400 K and 300 K and absorbs 800 J of heat from the hot reservoir per cycle. The work done per cycle is:',
    options: ['200 J', '300 J', '600 J', '100 J'],
    correctAnswer: 0,
    solution: 'η = 1 − 300/400 = 0.25. Work = η × Q_hot = 0.25 × 800 = 200 J.',
    estimatedTimeSeconds: 120,
  },

  // ─── Electrostatics → Coulomb's Law ───
  {
    id: 'q-009',
    topicId: 'tp-coulombs-law',
    difficulty: 'Medium',
    type: 'Conceptual',
    format: 'mcq',
    stem: 'Two point charges +q and +q are separated by distance r. If a third charge −q is placed exactly midway between them, the net force on the −q charge is:',
    options: ['kq²/r²', '2kq²/r²', 'Zero', '4kq²/r²'],
    correctAnswer: 2,
    solution: "By symmetry, the two equal positive charges exert equal and opposite forces on the −q charge at the midpoint. Net force = 0. (The −q charge is in unstable equilibrium.)",
    estimatedTimeSeconds: 90,
  },
  {
    id: 'q-010',
    topicId: 'tp-coulombs-law',
    difficulty: 'Easy',
    type: 'Recall',
    format: 'numerical',
    stem: 'The Coulomb constant k in SI units (in units of N·m²/C²) is approximately:',
    correctAnswer: 9,
    solution: 'k = 1/(4πε₀) ≈ 9 × 10⁹ N·m²/C². The expected answer is 9 (representing × 10⁹).',
    estimatedTimeSeconds: 30,
  },

  // ─── Electrostatics → Capacitors ───
  {
    id: 'q-011',
    topicId: 'tp-capacitors',
    difficulty: 'Medium',
    type: 'Application',
    format: 'numerical',
    stem: 'Three capacitors of 2 μF, 3 μF, and 6 μF are connected in series. Calculate the equivalent capacitance in microfarads.',
    correctAnswer: 1,
    solution: '1/C_eq = 1/2 + 1/3 + 1/6 = 3/6 + 2/6 + 1/6 = 6/6 = 1. So C_eq = 1 μF.',
    estimatedTimeSeconds: 90,
  },

  // ─── Magnetism → Magnetic Field ───
  {
    id: 'q-012',
    topicId: 'tp-magnetic-field',
    difficulty: 'Hard',
    type: 'Analytical',
    format: 'mcq',
    stem: 'A charged particle moving with velocity v perpendicular to a uniform magnetic field B describes a circular path of radius r. If both v and B are doubled, the new radius is:',
    options: ['r/2', 'r', '2r', '4r'],
    correctAnswer: 1,
    solution: 'Radius r = mv/(qB). If v → 2v and B → 2B, the new radius = m(2v)/(q × 2B) = mv/(qB) = r. Unchanged.',
    estimatedTimeSeconds: 120,
  },

  // ─── Optics → Ray Optics ───
  {
    id: 'q-013',
    topicId: 'tp-ray-optics',
    difficulty: 'Easy',
    type: 'Recall',
    format: 'mcq',
    stem: "Snell's law for refraction states that:",
    options: [
      'n₁ sin θ₁ = n₂ sin θ₂',
      'n₁ cos θ₁ = n₂ cos θ₂',
      'n₁ tan θ₁ = n₂ tan θ₂',
      'sin θ₁ + sin θ₂ = n₁ + n₂',
    ],
    correctAnswer: 0,
    solution: "Snell's law: n₁ sin θ₁ = n₂ sin θ₂, where n is the refractive index and θ is the angle from the normal.",
    estimatedTimeSeconds: 45,
  },
  {
    id: 'q-014',
    topicId: 'tp-ray-optics',
    difficulty: 'Medium',
    type: 'Application',
    format: 'numerical',
    stem: 'A convex lens has a focal length of 20 cm. An object is placed 30 cm in front of the lens. Calculate the image distance in cm (positive if on the opposite side).',
    correctAnswer: 60,
    solution: '1/f = 1/v − 1/u, with u = −30 cm and f = +20 cm. So 1/v = 1/20 + 1/(−30) (using sign convention 1/20 − 1/30 = 1/60), v = +60 cm. Image is 60 cm on the opposite side.',
    estimatedTimeSeconds: 120,
  },

  // ─── Modern Physics → Photoelectric Effect ───
  {
    id: 'q-015',
    topicId: 'tp-photoelectric',
    difficulty: 'Medium',
    type: 'Conceptual',
    format: 'mcq',
    stem: 'In the photoelectric effect, increasing the intensity of incident light (with frequency above threshold) causes:',
    options: [
      'Increase in maximum kinetic energy of photoelectrons',
      'Increase in number of photoelectrons emitted per second',
      'Increase in threshold frequency',
      'Decrease in stopping potential',
    ],
    correctAnswer: 1,
    solution: 'Intensity affects the rate of photoelectron emission, not their kinetic energy. KE depends only on frequency (E_k = hν − φ). This was a key Einstein insight.',
    estimatedTimeSeconds: 90,
  },

  // ═════════════════════════════════════════════════════════════════════════
  // CHEMISTRY
  // ═════════════════════════════════════════════════════════════════════════

  // ─── Basic Concepts → Mole Concept ───
  {
    id: 'q-101',
    topicId: 'tp-mole-concept',
    difficulty: 'Easy',
    type: 'Recall',
    format: 'mcq',
    stem: 'The number of atoms in 1 mole of any substance is approximately:',
    options: ['6.022 × 10²³', '3.011 × 10²³', '1.602 × 10⁻¹⁹', '9.109 × 10³¹'],
    correctAnswer: 0,
    solution: "Avogadro's number is 6.022 × 10²³. This is the number of particles (atoms, molecules, ions) in one mole of any substance.",
    estimatedTimeSeconds: 30,
  },
  {
    id: 'q-102',
    topicId: 'tp-mole-concept',
    difficulty: 'Medium',
    type: 'Application',
    format: 'numerical',
    stem: 'How many moles are present in 5.6 g of nitrogen gas (N₂)? Take molar mass of N as 14 g/mol.',
    correctAnswer: 0.2,
    solution: 'Molar mass of N₂ = 28 g/mol. Moles = mass / molar mass = 5.6 / 28 = 0.2 mol.',
    estimatedTimeSeconds: 60,
  },

  // ─── Atomic Structure → Bohr Model ───
  {
    id: 'q-103',
    topicId: 'tp-bohr-model',
    difficulty: 'Medium',
    type: 'Conceptual',
    format: 'mcq',
    stem: "According to Bohr's model, the radius of the n-th orbit of hydrogen is proportional to:",
    options: ['n', 'n²', '1/n', '1/n²'],
    correctAnswer: 1,
    solution: "Bohr's radius formula: rₙ = 0.529 × n² Å. Hence radius is proportional to n². This explains why higher orbits are spaced increasingly farther apart.",
    estimatedTimeSeconds: 60,
  },
  {
    id: 'q-104',
    topicId: 'tp-quantum-numbers',
    difficulty: 'Hard',
    type: 'Analytical',
    format: 'mcq',
    stem: 'For an electron in a 3p orbital, what are the values of (n, l, m_l)?',
    options: [
      'n=3, l=0, m_l = 0',
      'n=3, l=1, m_l ∈ {−1, 0, +1}',
      'n=3, l=2, m_l ∈ {−2, −1, 0, +1, +2}',
      'n=2, l=1, m_l = ±1',
    ],
    correctAnswer: 1,
    solution: 'For 3p: n=3 (principal), l=1 (p subshell), and m_l can be −1, 0, +1. The 3p subshell has three orbitals (3p_x, 3p_y, 3p_z).',
    estimatedTimeSeconds: 90,
  },

  // ─── Chemical Bonding → Hybridization ───
  {
    id: 'q-105',
    topicId: 'tp-hybridization',
    difficulty: 'Medium',
    type: 'Conceptual',
    format: 'mcq',
    stem: 'The hybridization of carbon in CH₄, C₂H₄, and C₂H₂ respectively is:',
    options: ['sp³, sp², sp', 'sp, sp², sp³', 'sp³, sp³, sp²', 'sp², sp³, sp'],
    correctAnswer: 0,
    solution: 'CH₄ has 4 single bonds → sp³ hybridization. C₂H₄ has a C=C double bond → sp² hybridization. C₂H₂ has a C≡C triple bond → sp hybridization.',
    estimatedTimeSeconds: 75,
  },

  // ─── Chemical Thermodynamics → Entropy & Gibbs ───
  {
    id: 'q-106',
    topicId: 'tp-entropy-gibbs',
    difficulty: 'Hard',
    type: 'Application',
    format: 'mcq',
    stem: 'A reaction has ΔH = +50 kJ and ΔS = +200 J/K. The minimum temperature (in K) above which it becomes spontaneous is approximately:',
    options: ['100 K', '200 K', '250 K', '500 K'],
    correctAnswer: 2,
    solution: 'For spontaneity, ΔG < 0, i.e., ΔH < TΔS. T > ΔH/ΔS = 50,000 J / 200 J·K⁻¹ = 250 K. Above 250 K the reaction becomes spontaneous.',
    estimatedTimeSeconds: 120,
  },

  // ─── Equilibrium → Acid-Base & pH ───
  {
    id: 'q-107',
    topicId: 'tp-acid-base-ph',
    difficulty: 'Easy',
    type: 'Recall',
    format: 'numerical',
    stem: 'What is the pH of a 0.001 M HCl solution? (HCl is a strong acid, fully dissociated.)',
    correctAnswer: 3,
    solution: 'For a strong acid: [H⁺] = 0.001 M = 10⁻³ M. pH = −log[H⁺] = −log(10⁻³) = 3.',
    estimatedTimeSeconds: 60,
  },
  {
    id: 'q-108',
    topicId: 'tp-le-chatelier',
    difficulty: 'Medium',
    type: 'Conceptual',
    format: 'mcq',
    stem: 'In the equilibrium N₂(g) + 3H₂(g) ⇌ 2NH₃(g) (ΔH < 0), increasing temperature will:',
    options: [
      'Shift equilibrium to the right (more NH₃)',
      'Shift equilibrium to the left (less NH₃)',
      'Not affect the equilibrium',
      'Stop the reaction entirely',
    ],
    correctAnswer: 1,
    solution: "By Le Chatelier's principle, raising T on an exothermic reaction shifts equilibrium toward reactants (absorbs heat). So less NH₃ at higher T — that's why the Haber process uses moderate temperatures despite slow kinetics at low T.",
    estimatedTimeSeconds: 90,
  },

  // ─── Hydrocarbons → Alkenes & Alkynes ───
  {
    id: 'q-109',
    topicId: 'tp-alkenes-alkynes',
    difficulty: 'Medium',
    type: 'Application',
    format: 'mcq',
    stem: 'Markovnikov addition of HBr to propene (CH₃-CH=CH₂) gives mainly:',
    options: ['CH₃-CH₂-CH₂Br', 'CH₃-CHBr-CH₃', 'CH₃-CHBr-CH₂Br', 'BrCH₂-CH₂-CH₂-Br'],
    correctAnswer: 1,
    solution: "Markovnikov's rule: H adds to the carbon with more H atoms, Br to the carbon with fewer. For propene, Br ends up on the central carbon (more substituted) → 2-bromopropane.",
    estimatedTimeSeconds: 90,
  },

  // ─── Solutions → Colligative Properties ───
  {
    id: 'q-110',
    topicId: 'tp-colligative-properties',
    difficulty: 'Hard',
    type: 'Analytical',
    format: 'numerical',
    stem: 'When 18 g of glucose (M = 180 g/mol) is dissolved in 1 kg of water, the freezing point depression is (Kf for water = 1.86 K·kg·mol⁻¹). Answer in K.',
    correctAnswer: 0.186,
    solution: 'Moles of glucose = 18/180 = 0.1 mol. Molality = 0.1 mol/kg. ΔT_f = Kf × m = 1.86 × 0.1 = 0.186 K.',
    estimatedTimeSeconds: 120,
  },

  // ─── Electrochemistry → Galvanic Cells ───
  {
    id: 'q-111',
    topicId: 'tp-galvanic-cells',
    difficulty: 'Medium',
    type: 'Conceptual',
    format: 'mcq',
    stem: 'In a Daniell cell (Zn|Zn²⁺ || Cu²⁺|Cu), the standard EMF is approximately +1.10 V. Which species is reduced?',
    options: [
      'Zn is reduced at the anode',
      'Cu²⁺ is reduced at the cathode',
      'Zn²⁺ is reduced at the cathode',
      'Cu is reduced at the anode',
    ],
    correctAnswer: 1,
    solution: 'Reduction always happens at the cathode. In Daniell cell, Cu²⁺ + 2e⁻ → Cu at the cathode (reduction); Zn → Zn²⁺ + 2e⁻ at the anode (oxidation).',
    estimatedTimeSeconds: 75,
  },

  // ─── Chemical Kinetics → Rate Laws ───
  {
    id: 'q-112',
    topicId: 'tp-rate-laws',
    difficulty: 'Hard',
    type: 'Conceptual',
    format: 'mcq',
    stem: 'For a first-order reaction, the half-life depends on:',
    options: [
      'Initial concentration only',
      'Rate constant only',
      'Both initial concentration and rate constant',
      'Temperature only',
    ],
    correctAnswer: 1,
    solution: 'For first-order reactions, t₁/₂ = 0.693/k. Independent of initial concentration. This is a defining feature — useful for radioactive decay analysis.',
    estimatedTimeSeconds: 90,
  },

  // ─── Coordination Compounds → Werner's Theory ───
  {
    id: 'q-113',
    topicId: 'tp-werner-theory',
    difficulty: 'Easy',
    type: 'Recall',
    format: 'mcq',
    stem: 'In the complex [Co(NH₃)₆]Cl₃, the coordination number of cobalt is:',
    options: ['3', '6', '9', '4'],
    correctAnswer: 1,
    solution: 'Coordination number = number of ligands directly bonded to the central metal. Six NH₃ ligands are bonded to Co, so coordination number = 6. The three Cl⁻ are counter-ions, outside the coordination sphere.',
    estimatedTimeSeconds: 45,
  },

  // ═════════════════════════════════════════════════════════════════════════
  // MATHEMATICS
  // ═════════════════════════════════════════════════════════════════════════

  // ─── Sets, Functions → Domain & Range ───
  {
    id: 'q-201',
    topicId: 'tp-domain-range',
    difficulty: 'Easy',
    type: 'Conceptual',
    format: 'mcq',
    stem: 'The domain of f(x) = √(x − 2) is:',
    options: ['(−∞, 2)', '[2, ∞)', '(2, ∞)', 'All real numbers'],
    correctAnswer: 1,
    solution: 'For the square root to be defined in real numbers, x − 2 ≥ 0, i.e., x ≥ 2. Domain = [2, ∞).',
    estimatedTimeSeconds: 60,
  },
  {
    id: 'q-202',
    topicId: 'tp-composition-functions',
    difficulty: 'Medium',
    type: 'Application',
    format: 'numerical',
    stem: 'If f(x) = x² + 1 and g(x) = 2x − 3, find (f ∘ g)(2).',
    correctAnswer: 2,
    solution: '(f ∘ g)(2) = f(g(2)) = f(2(2) − 3) = f(1) = 1² + 1 = 2.',
    estimatedTimeSeconds: 75,
  },

  // ─── Trigonometry → Identities ───
  {
    id: 'q-203',
    topicId: 'tp-trig-identities',
    difficulty: 'Easy',
    type: 'Recall',
    format: 'mcq',
    stem: 'The value of sin(75°) is:',
    options: ['(√6 − √2)/4', '(√6 + √2)/4', '(√3 + 1)/2', '(√3 − 1)/2'],
    correctAnswer: 1,
    solution: 'sin(75°) = sin(45° + 30°) = sin45°cos30° + cos45°sin30° = (√2/2)(√3/2) + (√2/2)(1/2) = (√6 + √2)/4.',
    estimatedTimeSeconds: 90,
  },
  {
    id: 'q-204',
    topicId: 'tp-trig-equations',
    difficulty: 'Hard',
    type: 'Analytical',
    format: 'mcq',
    stem: 'The number of solutions of sin(2x) = cos(x) in [0, 2π] is:',
    options: ['2', '3', '4', '5'],
    correctAnswer: 2,
    solution: '2sin(x)cos(x) = cos(x) → cos(x)(2sin(x) − 1) = 0. Either cos(x) = 0 (x = π/2, 3π/2) or sin(x) = 1/2 (x = π/6, 5π/6). Total: 4 solutions.',
    estimatedTimeSeconds: 150,
  },

  // ─── Complex / Quadratic ───
  {
    id: 'q-205',
    topicId: 'tp-quadratic-roots',
    difficulty: 'Medium',
    type: 'Application',
    format: 'numerical',
    stem: 'If α and β are roots of x² − 5x + 6 = 0, find α² + β².',
    correctAnswer: 13,
    solution: 'By Vieta: α + β = 5, αβ = 6. α² + β² = (α + β)² − 2αβ = 25 − 12 = 13.',
    estimatedTimeSeconds: 75,
  },
  {
    id: 'q-206',
    topicId: 'tp-argand-plane',
    difficulty: 'Medium',
    type: 'Conceptual',
    format: 'numerical',
    stem: 'The modulus of the complex number z = 3 + 4i is:',
    correctAnswer: 5,
    solution: '|z| = √(3² + 4²) = √(9 + 16) = √25 = 5. The classic 3-4-5 triangle in the Argand plane.',
    estimatedTimeSeconds: 45,
  },

  // ─── Sequences & Series ───
  {
    id: 'q-207',
    topicId: 'tp-ap-gp',
    difficulty: 'Easy',
    type: 'Application',
    format: 'numerical',
    stem: 'Find the 10th term of the arithmetic progression: 3, 7, 11, 15, …',
    correctAnswer: 39,
    solution: 'First term a = 3, common difference d = 4. a₁₀ = a + 9d = 3 + 9(4) = 39.',
    estimatedTimeSeconds: 60,
  },

  // ─── Permutations & Binomial ───
  {
    id: 'q-208',
    topicId: 'tp-permutations-combinations',
    difficulty: 'Medium',
    type: 'Application',
    format: 'numerical',
    stem: 'In how many ways can a committee of 3 be selected from 7 people?',
    correctAnswer: 35,
    solution: 'Order does not matter, so use combinations: C(7,3) = 7! / (3! × 4!) = 35.',
    estimatedTimeSeconds: 60,
  },
  {
    id: 'q-209',
    topicId: 'tp-binomial-expansion',
    difficulty: 'Hard',
    type: 'Analytical',
    format: 'numerical',
    stem: 'Find the coefficient of x⁵ in the expansion of (2 + x)⁸.',
    correctAnswer: 448,
    solution: 'General term: T_(r+1) = C(8,r) × 2^(8−r) × x^r. For x⁵, r = 5. Coefficient = C(8,5) × 2^(8−5) = 56 × 8 = 448.',
    estimatedTimeSeconds: 120,
  },

  // ─── Conic Sections ───
  {
    id: 'q-210',
    topicId: 'tp-parabola',
    difficulty: 'Medium',
    type: 'Conceptual',
    format: 'mcq',
    stem: 'For the parabola y² = 12x, the focus is at:',
    options: ['(3, 0)', '(0, 3)', '(−3, 0)', '(6, 0)'],
    correctAnswer: 0,
    solution: 'Comparing with y² = 4ax, 4a = 12, so a = 3. Focus is at (a, 0) = (3, 0). Directrix is x = −3.',
    estimatedTimeSeconds: 75,
  },

  // ─── Matrices & Determinants ───
  {
    id: 'q-211',
    topicId: 'tp-determinants-cofactors',
    difficulty: 'Medium',
    type: 'Application',
    format: 'numerical',
    stem: 'Find the determinant of the 2×2 matrix [[3, 4], [2, 5]].',
    correctAnswer: 7,
    solution: 'det = (3)(5) − (4)(2) = 15 − 8 = 7.',
    estimatedTimeSeconds: 45,
  },

  // ─── Continuity & Derivatives → Limits ───
  {
    id: 'q-212',
    topicId: 'tp-limits',
    difficulty: 'Hard',
    type: 'Analytical',
    format: 'numerical',
    stem: 'Evaluate lim(x→0) of (sin(3x) / x).',
    correctAnswer: 3,
    solution: 'Standard limit: lim(x→0) sin(kx)/x = k. So lim(x→0) sin(3x)/x = 3. Or formally: rewrite as 3 × (sin(3x) / 3x) and use lim(u→0) sin(u)/u = 1.',
    estimatedTimeSeconds: 90,
  },

  // ─── Integration → Indefinite ───
  {
    id: 'q-213',
    topicId: 'tp-indefinite-integrals',
    difficulty: 'Easy',
    type: 'Recall',
    format: 'mcq',
    stem: '∫ x² dx equals:',
    options: ['x³/3 + C', 'x³ + C', '2x + C', '3x² + C'],
    correctAnswer: 0,
    solution: 'Using the power rule: ∫xⁿ dx = x^(n+1)/(n+1) + C. For n = 2: x³/3 + C.',
    estimatedTimeSeconds: 30,
  },
  {
    id: 'q-214',
    topicId: 'tp-definite-integrals',
    difficulty: 'Medium',
    type: 'Application',
    format: 'numerical',
    stem: 'Evaluate the definite integral ∫₀¹ (3x² + 2x) dx.',
    correctAnswer: 2,
    solution: '∫₀¹ (3x² + 2x) dx = [x³ + x²]₀¹ = (1 + 1) − 0 = 2.',
    estimatedTimeSeconds: 75,
  },

  // ─── Vectors & 3D ───
  {
    id: 'q-215',
    topicId: 'tp-vector-algebra',
    difficulty: 'Medium',
    type: 'Application',
    format: 'numerical',
    stem: 'Find the dot product of vectors a = (2, 3, 4) and b = (1, 0, 5).',
    correctAnswer: 22,
    solution: 'a · b = (2)(1) + (3)(0) + (4)(5) = 2 + 0 + 20 = 22.',
    estimatedTimeSeconds: 45,
  },
];

// Helpers
export function getQuestionsByTopic(topicId: string): Question[] {
  return QUESTIONS.filter((q) => q.topicId === topicId);
}

export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}
