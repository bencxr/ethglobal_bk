using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Banana : MonoBehaviour
{
    //public GameController GameController;
    // Start is called before the first frame update
    void Start()
    {
        transform.rotation = Quaternion.Euler(0, 0, Random.Range(0, 360));
    }

    // Update is called once per frame
    void Update()
    {
        transform.Rotate(0, 0, -100 * Time.deltaTime); // Negative value for clockwise rotation, scaled by deltaTime
    }

    void OnTriggerEnter2D(Collider2D other)
    {
        // Debug.Log("Banana collided with " + other.gameObject.name);
        if (other.gameObject.CompareTag("Elephant"))
        {
            Destroy(gameObject);
        }
    }
}
