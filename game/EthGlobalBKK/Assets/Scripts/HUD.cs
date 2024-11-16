using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;

public class HUD : MonoBehaviour
{
    public GameController GameController;
    VisualElement Root;
    VisualElement Bananas;
    Label BananasQty;
    VisualElement Coins;
    VisualElement BananasIcon;
    Button PlantationButton;
    Button HomeButton;

    // Start is called before the first frame update
    void Start()
    {
        Root = GetComponent<UIDocument>().rootVisualElement;
        Bananas = Root.Q<VisualElement>("Bananas");
        BananasIcon = Root.Q<VisualElement>("BananaIcon");
        BananasQty = Root.Q<Label>("BananaQty");
        Coins = Root.Q<VisualElement>("Coins");
        PlantationButton = Root.Q<Button>("PlantationButton");
        HomeButton = Root.Q<Button>("HomeButton");

        BananasIcon.RegisterCallback<ClickEvent>(FeedElephant);
        PlantationButton.RegisterCallback<ClickEvent>(GoToPlantation);
        HomeButton.RegisterCallback<ClickEvent>(GoToHome);
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void ShowBananas()
    {
        Bananas.style.display = DisplayStyle.Flex;
    }

    public void ShowCoins()
    {
        Bananas.style.display = DisplayStyle.Flex;
    }

    public void ShowPlantation()
    {
        PlantationButton.style.display = DisplayStyle.Flex;
    }

    void FeedElephant(ClickEvent e)
    {
        GameController.FeedElephant();
    }

    public void SetBananas(int numBananas)
    {
        BananasQty.text = numBananas.ToString();
    }

    public void GoToPlantation(ClickEvent e)
    {
        GameController.GoToPlantation();
    }

    public void GoToHome(ClickEvent e)
    {
        GameController.GoToHome();
    }

    public void TogglePlantationButton(bool show)
    {
        if (show)
        {
            PlantationButton.style.display = DisplayStyle.Flex;
            HomeButton.style.display = DisplayStyle.None;
        }
        else
        {
            PlantationButton.style.display = DisplayStyle.None;
            HomeButton.style.display = DisplayStyle.Flex;
        }
    }
}
