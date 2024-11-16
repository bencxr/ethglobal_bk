using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Elephant : MonoBehaviour
{
    public GameController _GameController;
    public GameObject Heart;
    public Sprite ElephantHungry;
    public Sprite ElephantNeutral;
    public Sprite ElephantBoba;
    public Sprite ElephantUkulele;
    public Sprite ElephantLaptop;

    SpriteRenderer _SpriteRenderer;

    bool TriggeredLogin = false;


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

        if (_SpriteRenderer.sprite == ElephantBoba)
        {
            _DialogueManager.SetElephantText("Mmmmm so yummy!!");
        }
        else if (_SpriteRenderer.sprite == ElephantUkulele)
        {
            _DialogueManager.SetElephantText("La di la la laaaaa");
        }
        else if (_SpriteRenderer.sprite == ElephantLaptop)
        {
            _DialogueManager.SetElephantText("I'm learning about the internet!");
        }

        else if (HungerLevel > 0)
        {
            _DialogueManager.SetElephantText(HungryText[Random.Range(0, HungryText.Length)]);
        }
        else
        {
            _DialogueManager.SetElephantText(ElephantText[Random.Range(0, ElephantText.Length)]);

            if (!TriggeredLogin)
            {
                _GameController.TriggerLogin();
                TriggeredLogin = true;
            }
        }
        
    }

    public void DrinkBoba()
    {
        _SpriteRenderer.sprite = ElephantBoba;
    }

    public void PlayUkulele()
    {
        _SpriteRenderer.sprite = ElephantUkulele;
    }

    public void UseLaptop()
    {
        _SpriteRenderer.sprite = ElephantLaptop;
    }
}
