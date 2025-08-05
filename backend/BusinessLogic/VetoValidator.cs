using VETO.Models;

namespace VETO.BusinessLogic;

public static class VetoValidator
{

    public static List<string> ValidateVetoObject(VetoSystem veto)
    {
        try
        {
            // basic checks
            ArgumentNullException.ThrowIfNull(veto, nameof(veto));

            CheckForExistenceAndLength(veto.Title, 50, nameof(veto.Title));
            CheckForExistenceAndLength(veto.PlayerA, 25, nameof(veto.PlayerA));
            CheckForExistenceAndLength(veto.PlayerB, 25, nameof(veto.PlayerB));
            CheckForExistenceAndInList(veto.vetoSystem, [Constants.VETO_ABAB, Constants.VETO_ABBA], nameof(veto.vetoSystem));
            CheckForExistenceAndInList(veto.GameId, [Constants.STARCRAFT2], nameof(veto.GameId));
            CheckForExistenceAndInList(veto.Mode, [Constants.MODE_1V1, Constants.MODE_2V2, Constants.MODE_3V3, Constants.MODE_4V4, Constants.MODE_5V5], nameof(veto.Mode));
            CheckForExistenceAndInList(veto.BestOf, [Constants.BO1, Constants.BO3, Constants.BO5, Constants.BO7, Constants.BO9], nameof(veto.BestOf));

            ArgumentNullException.ThrowIfNull(veto.Maps, nameof(veto.Maps));
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(veto.Maps.Length, nameof(veto.Maps));

            // TODO: do specific checks for game
            ArgumentOutOfRangeException.ThrowIfGreaterThan(veto.Maps.Length, 20, nameof(veto.Maps));
        }
        catch (Exception exception)
        {
            return [exception.Message];
        }
        return [];
    }

    public static string FlatenErrors(List<string> errorList)
    {
        return string.Join(", ", errorList);
    }

    private static void CheckForExistenceAndLength(string input, int maxlength, string nameofText)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(input, nameofText);
        if (input.Length > maxlength)
            throw new ArgumentException($"Input {nameofText} is too long. Max length is {maxlength}", nameofText);
    }

    private static void CheckForExistenceAndInList(string input, string[] nameofInList, string nameofText)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(input, nameofText);
        if (!nameofInList.Any(x => x.Equals(input)))
        {
            throw new ArgumentException($"Input {input} of {nameofText} is not valid", nameofText);
        }
    }
}