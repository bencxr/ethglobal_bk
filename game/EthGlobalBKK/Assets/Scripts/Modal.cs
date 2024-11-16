using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;

public class Modal : MonoBehaviour
{
    VisualElement Root;
    VisualElement WelcomeContainer;
    VisualElement ConfirmationContainer;
    public GameController _GameController;
    // Start is called before the first frame update
    void Start()
    {
        Root = GetComponent<UIDocument>().rootVisualElement;
        WelcomeContainer = Root.Q<VisualElement>("Welcome");
        ConfirmationContainer = Root.Q<VisualElement>("ConfirmDeposit");
        Button WelcomeText = Root.Q<Button>("WelcomeText");

        WelcomeText.RegisterCallback<ClickEvent>(HideWelcome);
        Root.Q<Button>("ConfirmYes").RegisterCallback<ClickEvent>(ConfirmDepost);
        Root.Q<Button>("ConfirmNo").RegisterCallback<ClickEvent>(DeclineDeposit);
    }

    // Update is called once per frame
    public void ShowWelcome()
    {
        WelcomeContainer.style.display = DisplayStyle.Flex;
    }

    public void HideWelcome(ClickEvent e)
    {
        Debug.Log("HideWelcome");
        WelcomeContainer.style.display = DisplayStyle.None;
    }

    public void ShowConfirmation()
    {
        ConfirmationContainer.style.display = DisplayStyle.Flex;
    }

    public void ConfirmDepost(ClickEvent e)
    {
        ConfirmationContainer.style.display = DisplayStyle.None;
        _GameController.TriggerDeposit();
    }

    public void DeclineDeposit(ClickEvent e)
    {
        ConfirmationContainer.style.display = DisplayStyle.None;
    }
}
