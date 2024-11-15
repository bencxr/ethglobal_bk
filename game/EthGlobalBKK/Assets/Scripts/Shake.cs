using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Shake : MonoBehaviour
{

    private enum Direction { Left, Right };
    private Direction ShakeDirection;

    private bool IsShaking = false;
    public int ShakeSpeed = 3;

    private int NumShakes = 0;
    private float PreviousZ = 0;

   

    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        if (IsShaking)
        {
            ContinueShake();
        }
    }

    void OnMouseDown()
    {
        StartShake();
        Debug.Log("Start Shaking");
    }

    void StartShake()
    {
        IsShaking = true;
        ShakeDirection = Direction.Right;
        NumShakes = 0;
    }

    void StopShake()
    {
        IsShaking = false;
        transform.eulerAngles = new Vector3(0, 0, 0);
        PreviousZ = 0;
        NumShakes = 0;

        // transform.position = transform.position + new Vector3(horizontalInput * movementSpeed * Time.deltaTime, verticalInput * movementSpeed * Time.deltaTime, 0);
    }

    void ContinueShake()
    {
        if ( ShakeDirection == Direction.Right )
        {
            transform.Rotate (Vector3.forward * ShakeSpeed * Time.deltaTime * -1);
            if (transform.eulerAngles.z < (345 + NumShakes * 3) && transform.eulerAngles.z > (15 - NumShakes * 3)) {
                ShakeDirection = Direction.Left;
            }
            if (PreviousZ < 15 && transform.eulerAngles.z > 15)
            {
                NumShakes++;
            }
        } 
        else 
        {
            transform.Rotate (Vector3.forward * ShakeSpeed * Time.deltaTime);
            if (transform.eulerAngles.z > (15 - NumShakes * 3) && transform.eulerAngles.z < (345 + NumShakes * 3)) {
                ShakeDirection = Direction.Right;
            }
            if (PreviousZ > 15 && transform.eulerAngles.z < 15)
            {
                NumShakes++;
            }
        }
        if (NumShakes == 5)
        {
            StopShake();
            Debug.Log("Stop Shake");
        }

        PreviousZ = transform.eulerAngles.z;
    }
}
