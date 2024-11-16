mergeInto(LibraryManager.library, {
  PromptLogin: function () {
    window.dispatchReactUnityEvent("PromptLogin");
  },
});