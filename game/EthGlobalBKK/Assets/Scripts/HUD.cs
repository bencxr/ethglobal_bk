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
    Label CoinsQty;
    Button CoinsButton;
    VisualElement Trees;
    Label TreesQty;
    Button TreesButton;
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
        CoinsQty = Root.Q<Label>("CoinsQty");
        CoinsButton = Root.Q<Button>("CoinsButton");
        Trees = Root.Q<VisualElement>("Trees");
        TreesQty = Root.Q<Label>("TreesQty");
        TreesButton = Root.Q<Button>("TreesButton");
        PlantationButton = Root.Q<Button>("PlantationButton");
        HomeButton = Root.Q<Button>("HomeButton");

        BananasIcon.RegisterCallback<ClickEvent>(FeedElephant);
        PlantationButton.RegisterCallback<ClickEvent>(GoToPlantation);
        HomeButton.RegisterCallback<ClickEvent>(GoToHome);
        CoinsButton.RegisterCallback<ClickEvent>(TriggerFunding);
        TreesButton.RegisterCallback<ClickEvent>(ConfirmDepost);
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
        Coins.style.display = DisplayStyle.Flex;
    }

    public void ShowTrees()
    {
        Trees.style.display = DisplayStyle.Flex;
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

    public void SetCoins(int numCoins)
    {
        CoinsQty.text = numCoins.ToString();
    }

    public void SetTrees(int numTrees)
    {
        TreesQty.text = numTrees.ToString();
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

    public void TriggerFunding(ClickEvent e)
    {
        Debug.Log("TriggerFunding");
        GameController.TriggerFunding();
    }

    public void ConfirmDepost(ClickEvent e)
    {
        GameController.ConfirmDepost();
    }
}
