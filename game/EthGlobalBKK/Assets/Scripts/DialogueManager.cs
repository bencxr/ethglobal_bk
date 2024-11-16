using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;

public class DialogueManager : MonoBehaviour
{   
    VisualElement Root;
    VisualElement TextContainer;
    Label TextBox;
    Button NextButton;

    VisualElement ElephantContainer;
    Label ElephantText;
    Button ElephantButton;
    

    public bool IsShakingEgg = false;
    int OnShakePhase = 0;
    string[] ShakeText = new string[] {"Poke the egg!", "Keep poking!!", "poke poke...", "poke poke poke...", "poke poke poke poke...", "Almost there...!"};

    enum OnboardPhase { FirstHungry, FirstFed, LoggingIn, Plantation, OnboardDone };
    OnboardPhase CurrentPhase = OnboardPhase.FirstHungry;


    public GameController _GameController;

    // Start is called before the first frame update
    void Start()
    {
        Root = GetComponent<UIDocument>().rootVisualElement;
        TextBox = Root.Q<Label>("Text");
        NextButton = Root.Q<Button>("Next");
        TextContainer = Root.Q<VisualElement>("DialogueBox");

        ElephantText = Root.Q<Label>("ElephantText");
        ElephantButton = Root.Q<Button>("ElephantButton");
        ElephantContainer = Root.Q<VisualElement>("Elephant");

        NextButton.RegisterCallback<ClickEvent>(NextButtonClicked);
        ElephantButton.RegisterCallback<ClickEvent>(NextElephantButtonClicked);
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    void NextButtonClicked(ClickEvent e)
    {
        Debug.Log("Clicked");

        if (CurrentPhase == OnboardPhase.Plantation)
        {
            return;
        }

        if (CurrentPhase == OnboardPhase.LoggingIn)
        {
            _GameController.PromptPlantation();
            return;
        }

        IsShakingEgg = true;
        if(IsShakingEgg)
        {
            SetShakeText();
        }
    }

    void NextElephantButtonClicked(ClickEvent e)
    {
        if (CurrentPhase == OnboardPhase.FirstHungry)
        {
            CurrentPhase = OnboardPhase.FirstFed;
            SetMainText("Feed your baby some bananas!");
            _GameController.PromptBanana();
        }
    }

    public void SetShakeText()
    {
        TextBox.text = ShakeText[Mathf.Min(OnShakePhase, ShakeText.Length - 1)];
        OnShakePhase++;

        if (OnShakePhase > ShakeText.Length)
        {
            _GameController.HatchElephant();
        }
    }

    public void HatchElephantText()
    {
        TextBox.text = "A baby elephant hatched!";
    }

    public void SetMainText(string text)
    {
        TextBox.text = text;
        TextContainer.style.display = DisplayStyle.Flex;
        ElephantContainer.style.display = DisplayStyle.None;
    }

    public void SetElephantText(string text)
    {
        ElephantText.text = text;
        TextContainer.style.display = DisplayStyle.None;
        ElephantContainer.style.display = DisplayStyle.Flex;
    }

    public void PromptLogin()
    {
        SetMainText("Let's log into your account");
        CurrentPhase = OnboardPhase.LoggingIn;
    }
}
