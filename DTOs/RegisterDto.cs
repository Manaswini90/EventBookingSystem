using System.ComponentModel.DataAnnotations;

public class RegisterDto
{
    [Required]
    public string Name { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }
    [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$",
     ErrorMessage = "Password must be at least 6 characters and include letters, numbers, and special characters")]
    public string Password { get; set; }

    [Required]
    public string Role { get; set; }
}