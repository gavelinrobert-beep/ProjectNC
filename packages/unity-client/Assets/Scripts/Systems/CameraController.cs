using UnityEngine;

namespace MMORPG.Systems
{
    /// <summary>
    /// CameraController provides third-person camera functionality.
    /// Features orbit controls, collision detection, and smooth following.
    /// </summary>
    public class CameraController : MonoBehaviour
    {
        #region Constants
        
        /// <summary>Angle offset to position camera behind the target (180 degrees = directly behind).</summary>
        private const float BEHIND_TARGET_ANGLE = 180f;
        
        #endregion
        
        #region Configuration
        
        [Header("Target")]
        [SerializeField] private Transform target;
        [SerializeField] private Vector3 targetOffset = new Vector3(0, 1.5f, 0);
        
        [Header("Distance")]
        [SerializeField] private float distance = 8f;
        [SerializeField] private float minDistance = 2f;
        [SerializeField] private float maxDistance = 20f;
        [SerializeField] private float zoomSpeed = 5f;
        [SerializeField] private float zoomSmoothing = 10f;
        
        [Header("Rotation")]
        [SerializeField] private float rotationSensitivity = 3f;
        [SerializeField] private float minVerticalAngle = -30f;
        [SerializeField] private float maxVerticalAngle = 70f;
        
        [Header("Smoothing")]
        [SerializeField] private float positionSmoothing = 10f;
        [SerializeField] private float rotationSmoothing = 10f;
        
        [Header("Collision")]
        [SerializeField] private bool enableCollision = true;
        [SerializeField] private float collisionRadius = 0.3f;
        [SerializeField] private LayerMask collisionMask = -1;
        
        [Header("Auto-Rotate")]
        [SerializeField] private bool autoRotateBehindPlayer = true;
        [SerializeField] private float autoRotateDelay = 3f;
        [SerializeField] private float autoRotateSpeed = 2f;
        
        #endregion

        #region State
        
        private float currentDistance;
        private float targetDistance;
        private float horizontalAngle;
        private float verticalAngle;
        private float lastInputTime;
        private Vector3 currentPosition;
        private bool isRotating;
        
        #endregion

        #region Properties
        
        public Transform Target
        {
            get => target;
            set => target = value;
        }
        
        public float Distance
        {
            get => distance;
            set => distance = Mathf.Clamp(value, minDistance, maxDistance);
        }
        
        #endregion

        #region Unity Lifecycle
        
        private void Start()
        {
            currentDistance = distance;
            targetDistance = distance;
            
            // Initialize angles
            if (target != null)
            {
                Vector3 targetPosition = target.position + targetOffset;
                Vector3 toCamera = transform.position - targetPosition;
                
                horizontalAngle = Mathf.Atan2(toCamera.x, toCamera.z) * Mathf.Rad2Deg;
                verticalAngle = Mathf.Asin(toCamera.y / toCamera.magnitude) * Mathf.Rad2Deg;
            }
            
            currentPosition = transform.position;
        }
        
        private void LateUpdate()
        {
            if (target == null)
            {
                return;
            }
            
            HandleInput();
            HandleZoom();
            UpdateCameraPosition();
        }
        
        #endregion

        #region Input
        
        private void HandleInput()
        {
            // Right mouse button for camera rotation
            if (Input.GetMouseButton(1))
            {
                float mouseX = Input.GetAxis("Mouse X") * rotationSensitivity;
                float mouseY = Input.GetAxis("Mouse Y") * rotationSensitivity;
                
                horizontalAngle += mouseX;
                verticalAngle -= mouseY;
                verticalAngle = Mathf.Clamp(verticalAngle, minVerticalAngle, maxVerticalAngle);
                
                lastInputTime = Time.time;
                isRotating = true;
            }
            else
            {
                isRotating = false;
            }
            
            // Middle mouse button for panning (optional)
            if (Input.GetMouseButton(2))
            {
                // Could implement camera panning here
            }
            
            // Auto-rotate behind player when not manually rotating
            if (autoRotateBehindPlayer && !isRotating && Time.time - lastInputTime > autoRotateDelay)
            {
                float targetAngle = target.eulerAngles.y + BEHIND_TARGET_ANGLE;
                horizontalAngle = Mathf.MoveTowardsAngle(
                    horizontalAngle,
                    targetAngle,
                    autoRotateSpeed * Time.deltaTime
                );
            }
        }
        
        private void HandleZoom()
        {
            // Mouse scroll for zoom
            float scroll = Input.GetAxis("Mouse ScrollWheel");
            
            if (Mathf.Abs(scroll) > 0.01f)
            {
                targetDistance -= scroll * zoomSpeed;
                targetDistance = Mathf.Clamp(targetDistance, minDistance, maxDistance);
            }
            
            // Smooth zoom
            currentDistance = Mathf.Lerp(currentDistance, targetDistance, zoomSmoothing * Time.deltaTime);
        }
        
        #endregion

        #region Camera Update
        
        private void UpdateCameraPosition()
        {
            // Calculate target position (with offset)
            Vector3 targetPosition = target.position + targetOffset;
            
            // Calculate camera offset based on angles
            float radHorizontal = horizontalAngle * Mathf.Deg2Rad;
            float radVertical = verticalAngle * Mathf.Deg2Rad;
            
            Vector3 offset = new Vector3(
                Mathf.Sin(radHorizontal) * Mathf.Cos(radVertical),
                Mathf.Sin(radVertical),
                Mathf.Cos(radHorizontal) * Mathf.Cos(radVertical)
            );
            
            // Calculate desired position
            Vector3 desiredPosition = targetPosition + offset * currentDistance;
            
            // Handle collision
            if (enableCollision)
            {
                desiredPosition = HandleCollision(targetPosition, desiredPosition);
            }
            
            // Smooth camera movement
            currentPosition = Vector3.Lerp(
                currentPosition,
                desiredPosition,
                positionSmoothing * Time.deltaTime
            );
            
            transform.position = currentPosition;
            
            // Look at target
            Quaternion targetRotation = Quaternion.LookRotation(targetPosition - transform.position);
            transform.rotation = Quaternion.Slerp(
                transform.rotation,
                targetRotation,
                rotationSmoothing * Time.deltaTime
            );
        }
        
        private Vector3 HandleCollision(Vector3 targetPos, Vector3 desiredPos)
        {
            // Cast a sphere from target to desired camera position
            Vector3 direction = desiredPos - targetPos;
            float targetDistance = direction.magnitude;
            
            if (Physics.SphereCast(
                targetPos,
                collisionRadius,
                direction.normalized,
                out RaycastHit hit,
                targetDistance,
                collisionMask))
            {
                // Move camera in front of obstacle
                return targetPos + direction.normalized * (hit.distance - collisionRadius * 0.5f);
            }
            
            return desiredPos;
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Set the camera target.
        /// </summary>
        public void SetTarget(Transform newTarget)
        {
            target = newTarget;
            
            if (target != null)
            {
                currentPosition = transform.position;
            }
        }
        
        /// <summary>
        /// Reset camera to default position behind target.
        /// </summary>
        public void ResetPosition()
        {
            if (target != null)
            {
                horizontalAngle = target.eulerAngles.y + 180f;
                verticalAngle = 15f;
                targetDistance = distance;
            }
        }
        
        /// <summary>
        /// Shake the camera (for impact effects).
        /// </summary>
        public void Shake(float intensity, float duration)
        {
            // Would implement camera shake here
            Debug.Log($"Camera shake: intensity={intensity}, duration={duration}");
        }
        
        /// <summary>
        /// Zoom to a specific distance.
        /// </summary>
        public void ZoomTo(float newDistance, float duration = 0.5f)
        {
            targetDistance = Mathf.Clamp(newDistance, minDistance, maxDistance);
            // Could add lerping over duration
        }
        
        #endregion
    }
}
