using UnityEngine;

namespace MMORPG.Animations
{
    /// <summary>
    /// CharacterAnimator handles animation state machine for characters.
    /// Syncs animation states with movement and combat actions.
    /// </summary>
    [RequireComponent(typeof(Animator))]
    public class CharacterAnimator : MonoBehaviour
    {
        #region Animation Parameter Hashes
        
        // Pre-computed animation parameter hashes for performance
        private static readonly int SPEED_HASH = Animator.StringToHash("Speed");
        private static readonly int IS_MOVING_HASH = Animator.StringToHash("IsMoving");
        private static readonly int IS_GROUNDED_HASH = Animator.StringToHash("IsGrounded");
        private static readonly int IS_IN_COMBAT_HASH = Animator.StringToHash("IsInCombat");
        private static readonly int IS_CASTING_HASH = Animator.StringToHash("IsCasting");
        private static readonly int IS_DEAD_HASH = Animator.StringToHash("IsDead");
        private static readonly int ATTACK_TRIGGER_HASH = Animator.StringToHash("Attack");
        private static readonly int CAST_TRIGGER_HASH = Animator.StringToHash("Cast");
        private static readonly int HIT_TRIGGER_HASH = Animator.StringToHash("Hit");
        private static readonly int DEATH_TRIGGER_HASH = Animator.StringToHash("Death");
        private static readonly int JUMP_TRIGGER_HASH = Animator.StringToHash("Jump");
        private static readonly int HORIZONTAL_HASH = Animator.StringToHash("Horizontal");
        private static readonly int VERTICAL_HASH = Animator.StringToHash("Vertical");
        private static readonly int ATTACK_TYPE_HASH = Animator.StringToHash("AttackType");
        
        #endregion

        #region Configuration
        
        [Header("Animation Settings")]
        [SerializeField] private float animationSmoothing = 10f;
        [SerializeField] private float minMoveThreshold = 0.1f;
        
        #endregion

        #region Components
        
        private Animator animator;
        
        #endregion

        #region State
        
        private float currentSpeed;
        private float targetSpeed;
        private bool isMoving;
        private bool isGrounded = true;
        private bool isInCombat;
        private bool isCasting;
        private bool isDead;
        
        #endregion

        #region Properties
        
        public bool IsMoving => isMoving;
        public bool IsInCombat => isInCombat;
        public bool IsCasting => isCasting;
        public bool IsDead => isDead;
        
        #endregion

        #region Unity Lifecycle
        
        private void Awake()
        {
            animator = GetComponent<Animator>();
        }
        
        private void Update()
        {
            // Smooth speed transitions
            currentSpeed = Mathf.Lerp(currentSpeed, targetSpeed, animationSmoothing * Time.deltaTime);
            animator.SetFloat(SPEED_HASH, currentSpeed);
        }
        
        #endregion

        #region Public Methods - Movement
        
        /// <summary>
        /// Set the movement speed for animation blending.
        /// </summary>
        public void SetSpeed(float speed)
        {
            targetSpeed = speed;
            isMoving = speed > minMoveThreshold;
            animator.SetBool(IS_MOVING_HASH, isMoving);
        }
        
        /// <summary>
        /// Set movement direction for strafing/directional animations.
        /// </summary>
        public void SetMovementDirection(Vector3 direction)
        {
            Vector3 localDir = transform.InverseTransformDirection(direction);
            animator.SetFloat(HORIZONTAL_HASH, localDir.x);
            animator.SetFloat(VERTICAL_HASH, localDir.z);
        }
        
        /// <summary>
        /// Set grounded state for jump/fall animations.
        /// </summary>
        public void SetGrounded(bool grounded)
        {
            isGrounded = grounded;
            animator.SetBool(IS_GROUNDED_HASH, grounded);
        }
        
        /// <summary>
        /// Trigger jump animation.
        /// </summary>
        public void TriggerJump()
        {
            animator.SetTrigger(JUMP_TRIGGER_HASH);
        }
        
        #endregion

        #region Public Methods - Combat
        
        /// <summary>
        /// Set combat stance.
        /// </summary>
        public void SetInCombat(bool inCombat)
        {
            isInCombat = inCombat;
            animator.SetBool(IS_IN_COMBAT_HASH, inCombat);
        }
        
        /// <summary>
        /// Trigger attack animation.
        /// </summary>
        public void TriggerAttack(int attackType = 0)
        {
            animator.SetInteger(ATTACK_TYPE_HASH, attackType);
            animator.SetTrigger(ATTACK_TRIGGER_HASH);
        }
        
        /// <summary>
        /// Start casting animation.
        /// </summary>
        public void StartCasting()
        {
            isCasting = true;
            animator.SetBool(IS_CASTING_HASH, true);
            animator.SetTrigger(CAST_TRIGGER_HASH);
        }
        
        /// <summary>
        /// Stop casting animation.
        /// </summary>
        public void StopCasting()
        {
            isCasting = false;
            animator.SetBool(IS_CASTING_HASH, false);
        }
        
        /// <summary>
        /// Trigger hit reaction animation.
        /// </summary>
        public void TriggerHit()
        {
            if (!isDead)
            {
                animator.SetTrigger(HIT_TRIGGER_HASH);
            }
        }
        
        /// <summary>
        /// Trigger death animation.
        /// </summary>
        public void TriggerDeath()
        {
            isDead = true;
            animator.SetBool(IS_DEAD_HASH, true);
            animator.SetTrigger(DEATH_TRIGGER_HASH);
        }
        
        /// <summary>
        /// Reset from death (resurrect).
        /// </summary>
        public void ResetFromDeath()
        {
            isDead = false;
            animator.SetBool(IS_DEAD_HASH, false);
        }
        
        #endregion

        #region Animation Events
        
        // These methods can be called from animation events
        
        /// <summary>
        /// Called at the moment attack should deal damage.
        /// </summary>
        public void OnAttackHitFrame()
        {
            // Would trigger damage calculation
            Debug.Log("Animation Event: Attack hit frame");
        }
        
        /// <summary>
        /// Called when spell cast should complete.
        /// </summary>
        public void OnCastComplete()
        {
            Debug.Log("Animation Event: Cast complete");
            StopCasting();
        }
        
        /// <summary>
        /// Called for footstep sounds.
        /// </summary>
        public void OnFootstep()
        {
            // Would play footstep sound
        }
        
        #endregion
    }
}

/*
 * Animator Controller Setup Guide:
 * 
 * Create an Animator Controller with the following structure:
 * 
 * Parameters:
 * - Speed (float): Movement speed for blend trees
 * - IsMoving (bool): Whether character is moving
 * - IsGrounded (bool): Whether character is on ground
 * - IsInCombat (bool): Combat stance toggle
 * - IsCasting (bool): Casting state
 * - IsDead (bool): Death state
 * - Horizontal (float): Strafe direction
 * - Vertical (float): Forward/back direction
 * - AttackType (int): Type of attack animation
 * - Attack (trigger): Attack animation trigger
 * - Cast (trigger): Cast animation trigger
 * - Hit (trigger): Hit reaction trigger
 * - Death (trigger): Death animation trigger
 * - Jump (trigger): Jump animation trigger
 * 
 * States:
 * - Locomotion (Blend Tree)
 *   - Idle
 *   - Walk
 *   - Run
 * - Combat Locomotion (Blend Tree)
 * - Attack (various attack animations)
 * - Cast
 * - Hit
 * - Jump
 * - Fall
 * - Land
 * - Death
 * 
 * Transitions:
 * - Any State -> Death (IsDead = true)
 * - Locomotion <-> Combat Locomotion (IsInCombat)
 * - Any State -> Jump (Jump trigger)
 * - Jump -> Fall (when not grounded)
 * - Fall -> Land (when grounded)
 * - Combat states -> Attack (Attack trigger)
 * - Any State -> Cast (Cast trigger, IsCasting = true)
 * - Cast -> Exit (IsCasting = false)
 * - Any State -> Hit (Hit trigger, priority check)
 */
