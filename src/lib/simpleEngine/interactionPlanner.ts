import type {
  CreateThumbnailInput,
  PhysicalInteractionPlan,
  ResearchFact,
  ScenePlan,
  ThemeContext
} from '../../types/simple.ts';

// Helper for phrase boundary matching
function matchBoundary(text: string, pattern: string): boolean {
  const re = new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${pattern})(?:[^\\p{L}\\p{N}]|$)`, 'iu');
  return re.test(text);
}

/**
 * Checks if the user explicitly specified an unusual or custom hand pose.
 * If true, user intent remains authoritative and the planner must NOT replace it.
 */
export function hasExplicitUserPose(userText: string): boolean {
  return matchBoundary(
    userText,
    'acima\\s*da\\s*cabe[çc]a|uma\\s*m[ãa]o|s[óo]\\s*com\\s*uma|overhead|one\\s*hand|single\\s*hand|levantando|apontando|com\\s*o\\s*bra[çc]o\\s*esticado'
  );
}

/**
 * Physical Interaction Planner:
 * Resolves missing ergonomic and anatomical relationships between hands, arms, and objects.
 * Strict NO-OP if interaction is controlled by TARGET_IMAGE or explicit user pose.
 */
export function planPhysicalInteraction(
  input: CreateThumbnailInput,
  plan: ScenePlan,
  themeCtx?: ThemeContext,
  researchFacts?: ResearchFact[]
): PhysicalInteractionPlan {
  const { videoTitle = '', ideaDescription = '', references = [] } = input;
  const userText = `${videoTitle} ${ideaDescription}`.trim();

  // 1. RULE: TARGET interaction strictly wins
  if (plan.targetImage || plan.poseOwner === 'TARGET' || plan.taskType === 'IDENTITY_TRANSFER' || plan.taskType === 'REPLACE_OBJECT') {
    return {
      interactionConfidence: 1.0,
      applied: false,
      minimalAnatomicalAdaptation: 'Preserve target master body posture and hand interaction exactly.'
    };
  }

  // 2. RULE: Composition reference controls pose
  if (plan.compositionSource || plan.compositionOwner === 'COMPOSITION_REF') {
    return {
      interactionConfidence: 0.9,
      applied: false,
      minimalAnatomicalAdaptation: 'Preserve framing and spatial relationships from composition reference.'
    };
  }

  // 3. RULE: Explicit user pose strictly wins
  if (hasExplicitUserPose(userText)) {
    // Preserve the user's explicit pose with only basic physical plausibility guardrails
    const isOneHand = matchBoundary(userText, 'uma\\s*m[ãa]o|s[óo]\\s*com\\s*uma|one\\s*hand|single\\s*hand');
    return {
      numberOfHands: isOneHand ? 1 : 2,
      gripType: 'explicit user pose',
      handPlacement: 'as explicitly requested by user',
      distanceFromBody: 'extended according to user instruction',
      minimalAnatomicalAdaptation: 'Anatomically plausible fingers and natural wrist tension without chassis deformation.',
      interactionConfidence: 0.95,
      applied: false // NOT overriding user intent
    };
  }

  // Determine what physical object is in play
  const hasProdRef = Boolean(plan.productSource || (references || []).some(r => r.role === 'PRODUTO'));
  const prodName = plan.productSource?.name || '';
  const objList = themeCtx?.importantObjects || [];

  const isHandheld =
    matchBoundary(userText, 'rog\\s*ally|steam\\s*deck|switch|handheld|console\\s*port[aá]til|port[aá]til') ||
    matchBoundary(prodName, 'rog\\s*ally|steam\\s*deck|switch|handheld') ||
    objList.includes('ROG Ally X') ||
    objList.includes('Steam Deck');

  const isController = matchBoundary(userText, 'controle|controller|joystick|gamepad') || objList.includes('game controller');
  const isSmartphone = matchBoundary(userText, 'smartphone|celular|iphone') || objList.includes('smartphone');
  const isCamera = matchBoundary(userText, 'c[âa]mera|camera') || objList.includes('camera');
  const isBox = matchBoundary(userText, 'caixa\\s*misteriosa|caixa|box') || objList.includes('box');
  const isMap = matchBoundary(userText, 'mapa|map') || objList.includes('map');

  // Check if research provided geometry details
  const geometryFact = (researchFacts || []).find(f => f.category === 'PRODUCT_GEOMETRY' || f.category === 'CONTROL_LAYOUT');

  // Handheld Gaming Console (e.g., ROG Ally X, Steam Deck)
  if (isHandheld) {
    return {
      numberOfHands: 2,
      gripType: 'ergonomic two-handed controller side-grip',
      handPlacement: 'palms wrapping natural left and right chassis contours, thumbs resting naturally near front controls and analog sticks',
      objectOrientation: 'screen angled slightly toward viewer/camera (approx 15-20 degrees tilt) to remain clearly identifiable without glare',
      distanceFromBody: 'held comfortably in chest-to-mid-torso zone without obscuring facial expressions',
      wristRelationship: 'straight, neutral wrist alignment preventing unnatural bending or strain',
      elbowRelationship: 'elbows relaxed at torso sides, framing the hero device cleanly in lower third',
      faceVisibility: 'creator face 100% visible and unobscured above the device',
      objectVisibility: 'device silhouette, screen and controls fully legible at mobile scale',
      cameraRelationship: 'medium close-up framing establishing clear subject-object dialogue',
      minimalAnatomicalAdaptation: geometryFact
        ? `Grip tailored to authentic chassis contours: ${geometryFact.fact}`
        : 'Anatomically plausible fingers, natural occlusion, no fingers clipping through hardware.',
      interactionConfidence: 0.95,
      applied: true
    };
  }

  // Game Controller
  if (isController) {
    return {
      numberOfHands: 2,
      gripType: 'ergonomic dual-handed controller hold',
      handPlacement: 'both hands gripping side handles with index fingers naturally positioned along shoulder triggers',
      objectOrientation: 'controller face angled toward camera with visible analog sticks and buttons',
      distanceFromBody: 'mid-chest level',
      faceVisibility: 'unobscured',
      objectVisibility: 'clear silhouette',
      interactionConfidence: 0.9,
      applied: true
    };
  }

  // Smartphone
  if (isSmartphone) {
    return {
      numberOfHands: 1,
      gripType: 'natural single-hand perimeter grip',
      handPlacement: 'fingers securely supporting edges and back without blocking screen content or camera lens',
      objectOrientation: 'screen or back chassis presented cleanly toward camera',
      faceVisibility: 'unobscured',
      objectVisibility: 'clear',
      interactionConfidence: 0.85,
      applied: true
    };
  }

  // Camera
  if (isCamera) {
    return {
      numberOfHands: 2,
      gripType: 'photographic support grip',
      handPlacement: 'right hand grasping ergonomic body grip with index near shutter button, left hand cupping lens barrel from below',
      objectOrientation: 'lens angled dynamically toward or past camera',
      faceVisibility: 'unobscured or partially framed behind eyepiece',
      objectVisibility: 'clear hardware silhouette',
      interactionConfidence: 0.9,
      applied: true
    };
  }

  // Box / Mystery Box / Hero Artifact
  if (isBox) {
    return {
      numberOfHands: 2,
      gripType: 'two-handed presentation support',
      handPlacement: 'hands supporting bottom corners and sides of the box without covering the front surface',
      objectOrientation: 'box angled slightly toward camera to highlight depth and dimension',
      distanceFromBody: 'held forward in lower-to-mid chest region',
      faceVisibility: 'creator face fully visible looking toward the object with curiosity',
      objectVisibility: 'box silhouette clean and unobstructed',
      interactionConfidence: 0.9,
      applied: true
    };
  }

  // Map / Expedition Scroll
  if (isMap) {
    return {
      numberOfHands: 2,
      gripType: 'two-handed tactile document grip',
      handPlacement: 'hands naturally holding outer edges or corners of the aged parchment',
      objectOrientation: 'map angled forward at chest level',
      faceVisibility: 'face clearly visible with focused gaze directed toward the map',
      objectVisibility: 'parchment textures and contours readable',
      interactionConfidence: 0.9,
      applied: true
    };
  }

  // General fallback if a product exists but no specific form matched
  if (hasProdRef || plan.productOwner !== 'NONE') {
    return {
      numberOfHands: 2,
      gripType: 'natural physical hold',
      handPlacement: 'hands supporting object naturally along physical contact points',
      faceVisibility: 'unobscured',
      objectVisibility: 'prominent and legible',
      interactionConfidence: 0.8,
      applied: true
    };
  }

  // No object interaction needed
  return {
    interactionConfidence: 1.0,
    applied: false
  };
}
