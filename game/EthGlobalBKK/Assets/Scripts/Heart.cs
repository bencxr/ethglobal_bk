using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Heart : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        transform.Translate(Vector3.up * Time.deltaTime * 3); // Move upward over time
        if (transform.position.y > 5f)
        {
            Destroy(gameObject);
        }
    }
}
