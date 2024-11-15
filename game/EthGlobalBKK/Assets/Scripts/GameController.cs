using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;

public class GameController : MonoBehaviour
{
    public DialogueManager _DialogueManager;
    public GameObject Egg;
    public GameObject Elephant;

    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void HatchElephant()
    {
        Egg.SetActive(false);
        Elephant.SetActive(true);
        _DialogueManager.HatchElephantText();
    }
}
