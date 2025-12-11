using UnityEngine;

namespace MMORPG.Characters
{
    /// <summary>
    /// PlayerController handles local player input and movement.
    /// Implements client-side prediction for responsive movement.
    /// Server authority is maintained through position corrections.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        #region Configuration
        
        [Header("Movement Settings")]
        [SerializeField] private float walkSpeed = 5f;
        [SerializeField] private float runSpeed = 8f;
        [SerializeField] private float rotationSpeed = 720f;
        [SerializeField] private float gravity = -20f;
        [SerializeField] private float jumpHeight = 2f;
        
        [Header("Ground Detection")]
        [SerializeField] private float groundCheckDistance = 0.2f;
        [SerializeField] private LayerMask groundMask;
        
        [Header("Network Settings")]
        [SerializeField] private float sendInterval = 0.05f; // 20 Hz
        [SerializeField] private float correctionThreshold = 2f;
        [SerializeField] private float correctionSpeed = 10f;
        
        #endregion

        #region Components
        
        private CharacterController characterController;
        private Camera mainCamera;
        
        #endregion

        #region State
        
        private Vector3 velocity;
        private bool isGrounded;
        private bool isRunning = true;
        private float lastSendTime;
        
        // Client-side prediction
        private Vector3 predictedPosition;
        private Vector3 serverPosition;
        private bool hasServerPosition = false;
        
        // Input
        private Vector3 inputDirection;
        private bool jumpRequested;
        
        #endregion

        #region Properties
        
        public bool IsMoving => inputDirection.magnitude > 0.1f;
        public float CurrentSpeed => isRunning ? runSpeed : walkSpeed;
        
        #endregion

        #region Unity Lifecycle
        
        private void Awake()
        {
            characterController = GetComponent<CharacterController>();
            mainCamera = Camera.main;
        }
        
        private void Start()
        {
            predictedPosition = transform.position;
        }
        
        private void Update()
        {
            HandleInput();
            HandleRotation();
            SendMovementToServer();
        }
        
        private void FixedUpdate()
        {
            HandleGroundCheck();
            HandleMovement();
            ApplyServerCorrection();
        }
        
        #endregion

        #region Input
        
        private void HandleInput()
        {
            // WASD / Arrow key input
            float horizontal = Input.GetAxis("Horizontal");
            float vertical = Input.GetAxis("Vertical");
            
            // Convert input to world-space direction based on camera
            if (mainCamera != null)
            {
                Vector3 cameraForward = mainCamera.transform.forward;
                Vector3 cameraRight = mainCamera.transform.right;
                
                // Remove Y component for ground movement
                cameraForward.y = 0;
                cameraRight.y = 0;
                cameraForward.Normalize();
                cameraRight.Normalize();
                
                inputDirection = (cameraForward * vertical + cameraRight * horizontal).normalized;
            }
            else
            {
                inputDirection = new Vector3(horizontal, 0, vertical).normalized;
            }
            
            // Run toggle
            if (Input.GetKeyDown(KeyCode.LeftShift))
            {
                isRunning = !isRunning;
            }
            
            // Jump
            if (Input.GetButtonDown("Jump") && isGrounded)
            {
                jumpRequested = true;
            }
        }
        
        #endregion

        #region Movement
        
        private void HandleGroundCheck()
        {
            // Check if grounded using raycast
            isGrounded = Physics.Raycast(
                transform.position + Vector3.up * 0.1f,
                Vector3.down,
                groundCheckDistance + 0.1f,
                groundMask
            );
            
            // Reset vertical velocity when grounded
            if (isGrounded && velocity.y < 0)
            {
                velocity.y = -2f; // Small downward force to keep grounded
            }
        }
        
        private void HandleMovement()
        {
            // Calculate move speed
            float currentSpeed = isRunning ? runSpeed : walkSpeed;
            
            // Apply horizontal movement
            Vector3 move = inputDirection * currentSpeed;
            
            // Apply gravity
            velocity.y += gravity * Time.fixedDeltaTime;
            
            // Handle jump
            if (jumpRequested && isGrounded)
            {
                velocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);
                jumpRequested = false;
            }
            
            // Combine horizontal and vertical movement
            Vector3 totalMove = move * Time.fixedDeltaTime + velocity * Time.fixedDeltaTime;
            
            // Move character
            characterController.Move(totalMove);
            
            // Update predicted position
            predictedPosition = transform.position;
        }
        
        private void HandleRotation()
        {
            // Rotate to face movement direction
            if (inputDirection.magnitude > 0.1f)
            {
                Quaternion targetRotation = Quaternion.LookRotation(inputDirection);
                transform.rotation = Quaternion.RotateTowards(
                    transform.rotation,
                    targetRotation,
                    rotationSpeed * Time.deltaTime
                );
            }
        }
        
        #endregion

        #region Networking
        
        private void SendMovementToServer()
        {
            // Rate limit sends
            if (Time.time - lastSendTime < sendInterval)
            {
                return;
            }
            
            // Only send if moving or just stopped
            if (!IsMoving && velocity.y > -5f)
            {
                return;
            }
            
            lastSendTime = Time.time;
            
            // Send movement to server
            if (Network.NetworkManager.Instance != null)
            {
                string moveType = isRunning ? "RUN" : "WALK";
                Network.NetworkManager.Instance.SendMove(transform.position, moveType);
            }
        }
        
        /// <summary>
        /// Apply a position correction from the server.
        /// </summary>
        public void ApplyServerPosition(Vector3 position)
        {
            serverPosition = position;
            hasServerPosition = true;
        }
        
        private void ApplyServerCorrection()
        {
            if (!hasServerPosition)
            {
                return;
            }
            
            // Calculate distance from server position
            float distance = Vector3.Distance(transform.position, serverPosition);
            
            // Only correct if difference is significant
            if (distance > correctionThreshold)
            {
                // Teleport for large corrections
                Debug.LogWarning($"PlayerController: Large position correction ({distance:F2} units)");
                characterController.enabled = false;
                transform.position = serverPosition;
                characterController.enabled = true;
            }
            else if (distance > 0.1f)
            {
                // Smooth interpolation for small corrections
                Vector3 correctedPosition = Vector3.Lerp(
                    transform.position,
                    serverPosition,
                    correctionSpeed * Time.fixedDeltaTime
                );
                
                Vector3 correction = correctedPosition - transform.position;
                characterController.Move(correction);
            }
        }
        
        #endregion

        #region Click-to-Move
        
        /// <summary>
        /// Move to a clicked world position.
        /// </summary>
        public void MoveToPosition(Vector3 targetPosition)
        {
            // Calculate direction to target
            Vector3 direction = targetPosition - transform.position;
            direction.y = 0;
            
            if (direction.magnitude > 0.5f)
            {
                inputDirection = direction.normalized;
            }
        }
        
        /// <summary>
        /// Stop all movement.
        /// </summary>
        public void StopMovement()
        {
            inputDirection = Vector3.zero;
        }
        
        #endregion
    }
}
