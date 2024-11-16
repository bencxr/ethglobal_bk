using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Monkey : MonoBehaviour
{
    public GameController _GameController;
    public DialogueManager _DialogueManager;


    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    void OnMouseDown()
    {
        _DialogueManager.SetMonkeyText("I'm trying to grow my Banana farm. Can you help?");
    }
}
