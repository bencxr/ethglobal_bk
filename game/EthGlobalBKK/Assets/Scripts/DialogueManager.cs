using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;

public class DialogueManager : MonoBehaviour
{
    VisualElement Root;
    Label TextBox;
    Button NextButton;

    public bool IsShakingEgg = false;
    int OnShakePhase = 0;
    string[] ShakeText = new string[] {"Poke the egg!", "Keep poking!!", "poke poke...", "poke poke poke...", "poke poke poke poke...", "Almost there...!"};


    public GameController _GameController;

    // Start is called before the first frame update
    void Start()
    {
        Root = GetComponent<UIDocument>().rootVisualElement;
        TextBox = Root.Q<Label>("Text");
        NextButton = Root.Q<Button>("Next");

        NextButton.RegisterCallback<ClickEvent>(NextButtonClicked);

        //Root.Q<Label>("Text").text = "huh";
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    void NextButtonClicked(ClickEvent e)
    {
        Debug.Log("Clicked");

        IsShakingEgg = true;
        if(IsShakingEgg)
        {
            SetShakeText();
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
}
