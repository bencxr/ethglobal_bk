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

    Button BobaButton;
    Button UkuleleButton;
    Button LaptopButton;    

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
        BobaButton = Root.Q<Button>("BobaButton");
        UkuleleButton = Root.Q<Button>("UkuleleButton");
        LaptopButton = Root.Q<Button>("LaptopButton");  

        BananasIcon.RegisterCallback<ClickEvent>(FeedElephant);
        PlantationButton.RegisterCallback<ClickEvent>(GoToPlantation);
        HomeButton.RegisterCallback<ClickEvent>(GoToHome);
        CoinsButton.RegisterCallback<ClickEvent>(TriggerFunding);
        TreesButton.RegisterCallback<ClickEvent>(ConfirmDepost);
        BobaButton.RegisterCallback<ClickEvent>(DrinkBoba);
        UkuleleButton.RegisterCallback<ClickEvent>(PlayUkulele);
        LaptopButton.RegisterCallback<ClickEvent>(UseLaptop);
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

    public void ShowItems()
    {
        BobaButton.style.display = DisplayStyle.Flex;
        UkuleleButton.style.display = DisplayStyle.Flex;
        LaptopButton.style.display = DisplayStyle.Flex;
    }

    public void HideItems()
    {
        BobaButton.style.display = DisplayStyle.None;
        UkuleleButton.style.display = DisplayStyle.None;
        LaptopButton.style.display = DisplayStyle.None;
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
        Debug.Log("ConfirmDepost");
        GameController.ConfirmDepost();
    }

    void DrinkBoba(ClickEvent e)
    {
        Debug.Log("DrinkBoba");
        GameController.DrinkBoba();
    }

    void PlayUkulele(ClickEvent e)
    {
        GameController.PlayUkulele();
    }
    
    void UseLaptop(ClickEvent e)
    {
        GameController.UseLaptop();
    }
}
