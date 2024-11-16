using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Monkey : MonoBehaviour
{
    public GameController _GameController;
    public DialogueManager _DialogueManager;
    private int DialogueStep = 0;

    string[] MonkeyText = new string[] {
        "I'm trying to grow my Banana Farm. Can you help?",
        "Click on the Coin icon to load some coins.",
        "Spend the coins to grow trees, which produce bananas!"};

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
        _DialogueManager.SetMonkeyText(MonkeyText[DialogueStep%3]);
        DialogueStep++;
    }
}
