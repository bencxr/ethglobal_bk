using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;

public class Modal : MonoBehaviour
{
    VisualElement Root;
    VisualElement WelcomeContainer;

    // Start is called before the first frame update
    void Start()
    {
        Root = GetComponent<UIDocument>().rootVisualElement;
        WelcomeContainer = Root.Q<VisualElement>("Welcome");
        Button WelcomeText = Root.Q<Button>("WelcomeText");

        WelcomeText.RegisterCallback<ClickEvent>(HideWelcome);
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
}
