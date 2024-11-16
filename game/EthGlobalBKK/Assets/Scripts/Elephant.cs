using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Elephant : MonoBehaviour
{
    public GameController _GameController;
    public GameObject Heart;
    public Sprite ElephantHungry;
    public Sprite ElephantNeutral;

    SpriteRenderer _SpriteRenderer;

    bool TriggeredLogin = false;;


    string[] ElephantText = new string[] {
        "Hi, I love you.",
        "Want to play?",
        "How are you?"
    };

    string[] HungryText = new string[] {
        "I'm Hungry!!",
        "Feed me!",
        "I'm starving!"
    };

    int HungerLevel;

    public DialogueManager _DialogueManager;
    // Start is called before the first frame update
    void Start()
    {
        HungerLevel = 5;
        _SpriteRenderer = GetComponent<SpriteRenderer>();
    }

    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.gameObject.CompareTag("Banana"))
        {
            HungerLevel--;
            Instantiate(Heart, transform.position, Quaternion.identity);

            if(HungerLevel == 0)
            {
                _SpriteRenderer.sprite = ElephantNeutral;
            }
        }
    }

    void OnMouseDown()
    {
        if (HungerLevel > 0)
        {
            _DialogueManager.SetElephantText(HungryText[Random.Range(0, HungryText.Length)]);
        }
        else
        {
            _DialogueManager.SetElephantText(ElephantText[Random.Range(0, ElephantText.Length)]);

            if (!TriggeredLogin)
            {
                _GameController.TriggeredLogin();
                TriggeredLogin = true;
            }
        }
        
    }
}
